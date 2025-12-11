import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverGrpcService } from '../driver-grpc.service';
import { LocationGrpcService } from '../../core/grpc/location.service';
import { RideRequestSnackbarComponent } from '../ride-request-snackbar/ride-request-snackbar.component';
import { TripGrpcService } from '../../core/grpc/trip.service';
import { NotificationService } from '../../core/grpc/notification.service';
import { MatchingGrpcService } from '../../core/grpc/matching.service';
import { DriverProfile, RoutePlan } from '../../../proto/driver';
import { EvaluateDriverRequest } from '../../../proto/matching';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, forkJoin, of, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { StationService } from '../../core/grpc/station.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  driverProfile: DriverProfile | null = null;
  activeRoute: RoutePlan | null = null;
  currentStopIndex = 0;
  isMoving = false; // false = At Stop, true = Moving to Next
  occupancy = 0;
  reservedOccupancy = 0; // Total booked seats (active + scheduled)
  private processedRiderIds = new Set<string>(); // Dedup notifications

  private notifSubscription: Subscription | null = null;
  private matchSubscription: Subscription | null = null;
  private locationTimerSub: Subscription | null = null;
  areas: Map<string, string> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverGrpcService,
    private locationService: LocationGrpcService,
    private tripService: TripGrpcService,
    private notificationService: NotificationService,
    private matchingService: MatchingGrpcService,
    private stationService: StationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Connect to notifications
    this.notifSubscription = this.notificationService.subscribe().subscribe(notif => {
      this.handleNotification(notif);
    });

    // Subscribe to matches (Backend filters by station IDs)
    // We will update subscription when route changes
    this.matchingService.subscribeMatches([]);

    // Connect to matching events
    this.matchSubscription = this.matchingService.matchEvents$.subscribe({
      next: (event) => {
        console.log('Received MatchEvent:', event);
        if (event) {
          const isNewRider = event.eventId.startsWith('new-rider');
          const isMatchFound = event.eventId.startsWith('match-found');

          if ((isNewRider || isMatchFound) && this.activeRoute) {
            // Silently check matches for any relevant event
            this.checkMatches(event.stationAreaId);

            // If precise match found (backend initiated), handle dedup logic in evaluateStation/accept logic
            if (isMatchFound && event.result) {
              // Maybe we should accept directly if it's a "Match Found"? 
              // But safer to let checkMatches/evaluateStation verify capacity first.
            }
          }
        }
      }
    });

    // Load areas for names
    this.stationService.listAreas().subscribe(areas => {
      areas.forEach(a => this.areas.set(a.id, a.name));
    });

    // Load profile
    const userId = this.authService.getUserId();
    if (userId) {
      this.driverService.getDriverByUserId(userId).subscribe({
        next: (profile) => {
          this.driverProfile = profile;
          // Initialize occupancy from active trips
          this.recalculateOccupancy();

          // Initial check if we have a route
          this.checkActiveRoute();
        },
        error: (err) => {
          console.error('Failed to load profile', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notifSubscription) {
      this.notifSubscription.unsubscribe();
    }
    if (this.matchSubscription) {
      this.matchSubscription.unsubscribe();
    }
    if (this.locationTimerSub) {
      this.locationTimerSub.unsubscribe();
    }
  }

  startLocationUpdates() {
    if (this.locationTimerSub) this.locationTimerSub.unsubscribe();
    // Every 10 seconds
    this.locationTimerSub = timer(0, 10000).subscribe(() => {
      this.updateLocation();
      // Also check matches periodically for approaching stops
      this.checkMatches();
    });
  }

  checkActiveRoute() {
    this.route.queryParams.subscribe(params => {
      const routeId = params['routeId'];
      if (routeId && this.driverProfile) {
        const route = this.driverProfile.routes.find(r => r.routeId === routeId);
        if (route) {
          this.activeRoute = route;
          this.currentStopIndex = 0;
          this.isMoving = false;
          // Update initial location
          this.updateLocation();
          this.checkMatches(); // Initial check for pending riders
          // Resubscribe with route stations
          const stationIds = this.activeRoute.stops.map(s => s.areaId);
          this.matchingService.subscribeMatches(stationIds);

          // Start periodic location updates
          this.startLocationUpdates();
        }
      }
    });
  }

  updateLocation() {
    if (!this.driverProfile || !this.activeRoute) return;

    // Report current stop or next stop if moving?
    const currentStop = this.activeRoute.stops[this.currentStopIndex];

    this.locationService.updateDriverLocation(
      this.driverProfile.driverId,
      this.activeRoute.routeId,
      currentStop.areaId,
      this.occupancy
    ).subscribe();
  }

  checkMatches(specificStationId?: string) {
    if (!this.driverProfile || !this.activeRoute) return;

    if (specificStationId) {
      this.evaluateStation(specificStationId);
      return;
    }

    // Loop upcoming stops within 10 minutes ETA
    const currentStop = this.activeRoute.stops[this.currentStopIndex];
    const currentOffset = currentStop.arrivalOffsetMinutes;

    for (let i = this.currentStopIndex; i < this.activeRoute.stops.length; i++) {
      const stop = this.activeRoute.stops[i];

      // Calculate ETA relative to current location
      // If isMoving, we are somewhere between current and next. 
      // For simplicity, use current stop offset as base.
      const eta = stop.arrivalOffsetMinutes - currentOffset;

      if (eta <= 10) {
        this.evaluateStation(stop.areaId, eta);
      } else {
        // Stops are sorted by offset, so we can stop checking
        break;
      }
    }
  }

  evaluateStation(stationId: string, eta: number = 0) {
    if (!this.driverProfile || !this.activeRoute) return;

    // Destinations: Last stop or any stop after stationId
    // For simplicity, reuse the last stop logic or simple filtering
    let destAreaId = this.activeRoute.stops[this.activeRoute.stops.length - 1].areaId;

    // Check available capacity (using RESERVED occupancy)
    const seats = (this.driverProfile.capacity || 4) - this.reservedOccupancy;

    const req: EvaluateDriverRequest = {
      driverId: this.driverProfile.driverId,
      routeId: this.activeRoute.routeId,
      stationAreaId: stationId,
      destinationAreaId: destAreaId,
      seatsAvailable: seats,
      etaToStationMinutes: eta,
      driverCurrentAreaId: this.activeRoute.stops[this.currentStopIndex].areaId,
      driverLastUpdate: undefined
    };

    this.matchingService.evaluateDriver(req).subscribe({
      next: (resp) => {
        if (resp.matched && resp.results.length > 0) {
          const result = resp.results[0];
          const riderId = result.riderIds[0];

          // Dedup: If we already showed this rider, don't spam.
          // Note: If rider cancels and re-requests, this might block them. 
          // But strict "excessive notifications" requirement takes precedence.
          if (this.processedRiderIds.has(riderId)) {
            return;
          }
          this.processedRiderIds.add(riderId);

          const msg = `Match Found! ${result.passengerCount || 1} passenger(s) at ${this.getAreaName(stationId)}`;
          this.snackBar.open(msg, 'Accept', { duration: 10000 })
            .onAction().subscribe(() => this.acceptRide(result));
        }
      },
      error: (err) => console.error('Error in evaluateStation', err)
    });
  }

  moveToNext() {
    if (!this.activeRoute) return;

    if (this.isMoving) {
      // Arrived at next stop
      this.currentStopIndex++;
      this.isMoving = false;
      this.updateLocation();

      // We check matches here too in case arrival triggers new window
      this.checkMatches();

      if (this.currentStopIndex >= this.activeRoute.stops.length) {
        this.endTrip();
      }
    } else {
      // Start moving to next stop
      if (this.currentStopIndex < this.activeRoute.stops.length - 1) {
        this.isMoving = true;
        // If we are leaving a stop, update status for trips starting at this stop
        const currentStopId = this.activeRoute.stops[this.currentStopIndex].areaId;
        this.updateTripStatusToActive(currentStopId);
      } else {
        this.endTrip();
      }
    }
  }

  updateTripStatusToActive(stationId?: string) {
    if (!this.driverProfile) return;
    this.tripService.getTrips(this.driverProfile.driverId, '').subscribe(res => {
      const activeTrips = res.trips.filter(t => t.status === 'SCHEDULED' || t.status === 'CREATED');
      activeTrips.forEach(t => {
        // Only activate trips that start at the current station
        if (!stationId || t.stationAreaId === stationId) {
          const newStatus = 'ACTIVE'; // Means 'Picked Up' / En Route
          this.tripService.updateTripStatus(t.tripId, newStatus).subscribe(() => {
            // After status update, recalculate to update visual occupancy
            this.recalculateOccupancy();
          });
        }
      });
    });
  }

  endTrip() {
    if (!this.driverProfile) {
      this.finishEndTrip();
      return;
    }

    // 1. Get all active active trips for this driver
    this.tripService.getTrips(this.driverProfile.driverId, '').pipe(
      catchError(err => {
        console.error('Failed to fetching trips during endTrip', err);
        return of({ trips: [] });
      })
    ).subscribe({
      next: (res) => {
        const activeTrips = res.trips.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

        if (activeTrips.length === 0) {
          this.finishEndTrip();
          return;
        }

        // 2. Mark each as COMPLETED
        const updates = activeTrips.map(t =>
          this.tripService.updateTripStatus(t.tripId, 'COMPLETED').pipe(
            catchError(err => {
              console.error(`Failed to complete trip ${t.tripId}`, err);
              return of(null);
            })
          )
        );

        forkJoin(updates).subscribe(() => {
          this.finishEndTrip();
        });
      },
      error: (err) => {
        // Should be caught by catchError above, but safety net
        console.error('Critical error in endTrip', err);
        this.finishEndTrip();
      }
    });
  }

  finishEndTrip() {
    this.snackBar.open('Trip ended. Don\'t forget to logout if you are done.', 'Close', { duration: 3000 });
    this.activeRoute = null;
    this.currentStopIndex = 0;
    this.isMoving = false;
    this.occupancy = 0;
    this.reservedOccupancy = 0;
    this.processedRiderIds.clear(); // Allow matching same riders in future trips
    // Explicitly navigate to select-route and clear query params
    this.router.navigate(['/driver/select-route'], { queryParams: {} });
  }

  acceptRide(matchResult: any) {
    // Use driverId from profile if available, otherwise fallback to userId (though mismatch risk exists)
    const driverId = this.driverProfile?.driverId || this.authService.getUserId() || '';

    this.tripService.createTrip(
      driverId,
      this.activeRoute?.routeId || '',
      matchResult.stationAreaId,
      matchResult.riderIds,
      matchResult.destinationAreaId,
      matchResult.passengerCount || matchResult.riderIds.length,
      new Date()
    ).subscribe({
      next: (trip) => {
        this.snackBar.open('Ride Accepted! Trip created.', 'OK', { duration: 3000 });
        this.recalculateOccupancy();
        this.updateLocation();
      },
      error: (err) => {
        this.snackBar.open('Failed to accept ride: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  handleNotification(notif: any) {
    const tripId = notif.metadata?.['tripId'];

    if (tripId) {
      this.snackBar.open(`New Trip Assigned! Trip ID: ${tripId}`, 'View', { duration: 5000 });
      this.recalculateOccupancy();
      return;
    }

    const passengerCount = notif.metadata?.['passengerCount'] || '1';
    const riderId = notif.metadata?.['riderId'];
    const stationId = notif.metadata?.['stationId']; // Note: metadata keys might vary

    // For direct ride requests, checking matches logic handles it via events. 
    // If we receive a generic notification, we might want to trigger checkMatches
    if (stationId) {
      this.checkMatches(stationId);
    }
  }

  getAreaName(id: string): string {
    return this.areas.get(id) || id;
  }

  recalculateOccupancy() {
    if (!this.driverProfile) return;
    this.tripService.getTrips(this.driverProfile.driverId, '').subscribe({
      next: (res) => {
        // Visual Occupancy: Only 'ACTIVE' (Picked Up) or 'IN_PROGRESS'
        let visualTotal = 0;
        let reservedTotal = 0;

        // Visual: Riders currently inside the vehicle
        const visualTrips = res.trips.filter(t => t.status === 'ACTIVE' || t.status === 'IN_PROGRESS');

        // Reserved: All booked trips not yet completed
        const reservedTrips = res.trips.filter(t => t.status === 'ACTIVE' || t.status === 'IN_PROGRESS' || t.status === 'CREATED' || t.status === 'SCHEDULED');

        visualTrips.forEach(t => {
          visualTotal += (t.passengerCount || t.riderIds.length);
        });

        reservedTrips.forEach(t => {
          reservedTotal += (t.passengerCount || t.riderIds.length);
        });

        this.occupancy = visualTotal;
        this.reservedOccupancy = reservedTotal;

        this.updateLocation();
      },
      error: (err) => console.error('Failed to recalculate occupancy', err)
    });
  }
}
