import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverGrpcService } from '../driver-grpc.service';
import { LocationGrpcService } from '../../core/grpc/location.service';
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

    // Subscribe to matches ONCE (Backend broadcasts all events, we filter client-side)
    this.matchingService.subscribeMatches('');

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
        if (resp.matched) {
          this.snackBar.open(resp.msg, 'Close', { duration: 5000 });
          // Update occupancy
          const addedPassengers = resp.results.reduce((acc, r) => acc + r.riderIds.length, 0);
          this.occupancy += addedPassengers;
          this.updateLocation(); // Broadcast new capacity
        } else {
          this.snackBar.open('No matches found: ' + resp.msg, 'Close', { duration: 3000 });
        }
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
    this.activeRoute = null;
    this.currentStopIndex = 0;
    this.isMoving = false;
    this.occupancy = 0;
    this.router.navigate(['/driver/select-route']);
    this.snackBar.open('Trip Ended', 'Close', { duration: 3000 });
  }

  handleNotification(notif: any) {
    const tripId = notif.metadataMap.find((m: any) => m[0] === 'tripId')?.[1];

    if (tripId) {
      this.snackBar.open(`New Trip Assigned! Trip ID: ${tripId}`, 'View', { duration: 5000 });
      // Fetch trip to update occupancy
      this.tripService.getTrip(tripId).subscribe(trip => {
        // Update occupancy
        this.occupancy += trip.riderIds.length;
        this.updateLocation();
      });
      return;
    }

    const passengerCount = notif.metadataMap.find((m: any) => m[0] === 'passengerCount')?.[1] || '1';
    const riderId = notif.metadataMap.find((m: any) => m[0] === 'riderId')?.[1];
    const stationId = notif.metadataMap.find((m: any) => m[0] === 'stationId')?.[1];
    const destId = notif.metadataMap.find((m: any) => m[0] === 'destinationId')?.[1];

    const snackBarRef = this.snackBar.open(
      `Ride Request: ${passengerCount} passengers. ${notif.body}`,
      'Accept',
      { duration: 10000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.acceptRide(riderId, stationId, destId, parseInt(passengerCount));
    });
  }

  acceptRide(riderId: string, stationId: string, destId: string, count: number) {
    if (!this.driverProfile || !this.activeRoute) return;

    this.tripService.createTrip(
      this.driverProfile.driverId,
      this.activeRoute.routeId,
      stationId,
      [riderId],
      destId
    ).subscribe({
      next: (trip) => {
        this.snackBar.open('Ride Accepted!', 'Close', { duration: 3000 });
        this.occupancy += count;
        this.updateLocation();
      },
      error: (err) => {
        console.error('Failed to accept ride', err);
        this.snackBar.open('Failed to accept ride', 'Close', { duration: 3000 });
      }
    });
  }

  getAreaName(id: string): string {
    return this.areas.get(id) || id;
  }
}
