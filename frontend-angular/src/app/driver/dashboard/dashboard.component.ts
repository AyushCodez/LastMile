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
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  private notifSubscription: Subscription | null = null;
  private matchSubscription: Subscription | null = null;
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
        if (event && event.eventId.startsWith('new-rider')) {
          if (!this.activeRoute) return;

          // Check if the event station is in our upcoming stops
          // We include the current stop and all future stops
          const upcomingStops = this.activeRoute.stops.slice(this.currentStopIndex);
          const pickupIndex = upcomingStops.findIndex(stop => stop.areaId === event.stationAreaId);

          let isRelevant = false;

          if (pickupIndex !== -1) {
            // Pickup is valid. Now check destination.
            const destId = event.result?.destinationAreaId;
            if (destId) {
              // Find destination in the stops strictly AFTER the pickup
              const destIndex = upcomingStops.findIndex((stop, idx) => idx > pickupIndex && stop.areaId === destId);
              if (destIndex !== -1) {
                isRelevant = true;
              }
            } else {
              // Relaxed check if destination is missing (backward compatibility)
              isRelevant = true;
            }
          }

          if (isRelevant) {
            // New rider arrived at a relevant station
            this.snackBar.open(`New rider at ${this.getAreaName(event.stationAreaId)} to ${this.getAreaName(event.result?.destinationAreaId || 'Unknown')}`, 'Check', { duration: 5000 })
              .onAction().subscribe(() => {
                this.checkMatches(event.stationAreaId);
              });
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
          this.checkMatches();
          // Resubscribe with route stations
          const stationIds = this.activeRoute.stops.map(s => s.areaId);
          this.matchingService.subscribeMatches(stationIds);
        }
      }
    });
  }

  updateLocation() {
    if (!this.driverProfile || !this.activeRoute) return;

    const currentStop = this.activeRoute.stops[this.currentStopIndex];

    this.locationService.updateDriverLocation(
      this.driverProfile.driverId,
      this.activeRoute.routeId,
      currentStop.areaId,
      this.occupancy
    ).subscribe();
  }

  checkMatches(stationId?: string) {
    if (!this.driverProfile || !this.activeRoute) return;

    let targetStationId = stationId;
    if (!targetStationId) {
      const currentStop = this.activeRoute.stops[this.currentStopIndex];
      targetStationId = currentStop.areaId;
      // If moving, prefer next stop?
      if (this.isMoving && this.currentStopIndex < this.activeRoute.stops.length - 1) {
        targetStationId = this.activeRoute.stops[this.currentStopIndex + 1].areaId;
      }
    }

    // Determine destination (next stop or final?)
    let destAreaId = '';
    // Find the stop *after* the target station
    // This is tricky. Let's just say destination is the end of the route for now, or the next stop after target.
    // If target is current stop, dest is next.
    // If target is next stop, dest is next-next.

    // Simple logic: Destination is the last stop on the route.
    if (this.activeRoute.stops.length > 0) {
      destAreaId = this.activeRoute.stops[this.activeRoute.stops.length - 1].areaId;
    }

    const req: EvaluateDriverRequest = {
      driverId: this.driverProfile.driverId,
      routeId: this.activeRoute.routeId,
      stationAreaId: targetStationId,
      destinationAreaId: destAreaId,
      seatsAvailable: 4 - this.occupancy,
      etaToStationMinutes: this.isMoving ? 5 : 0, // Rough estimate
      driverCurrentAreaId: this.activeRoute.stops[this.currentStopIndex].areaId,
      driverLastUpdate: undefined // Optional
    };

    this.matchingService.evaluateDriver(req).subscribe({
      next: (resp) => {
        if (resp.matched && resp.results.length > 0) {
          const result = resp.results[0];
          const riderId = result.riderIds[0]; // Assuming single rider for now

          const snackBarRef = this.snackBar.openFromComponent(RideRequestSnackbarComponent, {
            data: { message: `New Ride Request: ${resp.msg}` },
            duration: 10000, // Give them time to decide
            verticalPosition: 'top'
          });

          snackBarRef.onAction().subscribe(() => {
            this.acceptRide(result);
          });
        }
        // No "else" block for "No riders found" to avoid noise
      },
      error: (err) => {
        console.error('Error checking matches', err);
        this.snackBar.open('Error checking matches', 'Close', { duration: 3000 });
      }
    });
  }

  moveToNext() {
    if (!this.activeRoute) return;

    if (this.isMoving) {
      // Arrived at next stop
      this.currentStopIndex++;
      this.isMoving = false;
      this.updateLocation();
      this.checkMatches();

      if (this.currentStopIndex >= this.activeRoute.stops.length) {
        this.endTrip();
      }
    } else {
      // Start moving to next stop
      if (this.currentStopIndex < this.activeRoute.stops.length - 1) {
        this.isMoving = true;
        // If we are leaving the first stop (pickup), update trip status to ACTIVE
        if (this.currentStopIndex === 0) {
          this.updateTripStatusToActive();
        }
      } else {
        this.endTrip();
      }
    }
  }

  updateTripStatusToActive() {
    if (!this.driverProfile) return;
    this.tripService.getTrips(this.driverProfile.driverId, '').subscribe(res => {
      const activeTrips = res.trips.filter(t => t.status === 'SCHEDULED' || t.status === 'CREATED');
      activeTrips.forEach(t => {
        this.tripService.updateTripStatus(t.tripId, 'ACTIVE').subscribe();
      });
    });
  }

  endTrip() {
    if (!this.driverProfile) {
      this.finishEndTrip();
      return;
    }

    // 1. Get all active trips for this driver
    this.tripService.getTrips(this.driverProfile.driverId, '').subscribe({
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
        console.error('Failed to fetch trips for completion', err);
        this.finishEndTrip();
      }
    });
  }

  finishEndTrip() {
    this.snackBar.open('Trip ended successfully', 'Close', { duration: 3000 });
    this.activeRoute = null;
    this.currentStopIndex = 0;
    this.isMoving = false;
    this.occupancy = 0;
    this.router.navigate(['/driver']);
  }

  acceptRide(matchResult: any) {
    this.tripService.createTrip(
      this.authService.getUserId() || '',
      this.activeRoute?.routeId || '',
      matchResult.stationAreaId,
      matchResult.riderIds,
      matchResult.destinationAreaId,
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
    const destId = notif.metadata?.['destinationId'];

    // Construct a matchResult-like object for reuse
    const matchResult = {
      stationAreaId: stationId,
      destinationAreaId: destId,
      riderIds: [riderId],
      passengerCount: parseInt(passengerCount)
    };

    const snackBarRef = this.snackBar.open(
      `Ride Request: ${passengerCount} passengers. ${notif.body}`,
      'Accept',
      { duration: 10000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.acceptRide(matchResult);
    });
  }

  getAreaName(id: string): string {
    return this.areas.get(id) || id;
  }

  recalculateOccupancy() {
    if (!this.driverProfile) return;
    this.tripService.getTrips(this.driverProfile.driverId, '').subscribe({
      next: (res) => {
        // Count total riders in active trips
        let total = 0;
        const activeTrips = res.trips.filter(t => t.status === 'ACTIVE' || t.status === 'IN_PROGRESS' || t.status === 'CREATED' || t.status === 'SCHEDULED');
        activeTrips.forEach(t => {
          total += t.riderIds.length;
        });
        this.occupancy = total;
        this.updateLocation();
      },
      error: (err) => console.error('Failed to recalculate occupancy', err)
    });
  }
}
