import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StationService } from '../../core/grpc/station.service';
import { RiderGrpcService } from '../rider-grpc.service';
import { NotificationService } from '../../core/grpc/notification.service';
import { TripGrpcService } from '../../core/grpc/trip.service';
import { LocationGrpcService } from '../../core/grpc/location.service';
import { Area } from '../../../proto/common';
import { Trip } from '../../../proto/trip';
import { DriverSnapshot } from '../../../proto/location';
import { DriverProfile } from '../../../proto/driver';
import { DriverGrpcService } from '../../driver/driver-grpc.service';
import { MatchingGrpcService } from '../../core/grpc/matching.service';
import { CancelRideIntentRequest } from '../../../proto/matching';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { UserGrpcService } from '../../core/grpc/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  rideForm: FormGroup;
  stations: Area[] = [];
  destinations: Area[] = [];
  dashboardState: 'IDLE' | 'PENDING' | 'TRIP' = 'IDLE';
  loading = false;
  activeTrip: Trip | null = null;
  driverLocation: DriverSnapshot | null = null;
  driverProfile: DriverProfile | null = null;
  driverName: string = '';

  private notifSubscription: Subscription | null = null;
  private locSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private stationService: StationService,
    private riderService: RiderGrpcService,
    private notificationService: NotificationService,
    private tripService: TripGrpcService,
    private locationService: LocationGrpcService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private driverGrpcService: DriverGrpcService,
    private matchingService: MatchingGrpcService,
    private userService: UserGrpcService
  ) {
    this.rideForm = this.fb.group({
      stationId: ['', Validators.required],
      destinationId: ['', Validators.required],
      partySize: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      offsetMinutes: [0, [Validators.required, Validators.min(0), Validators.max(30)]]
    });
  }

  ngOnInit(): void {
    this.loadAreas();
    this.checkPersistentState();

    this.notifSubscription = this.notificationService.subscribe().subscribe(notif => {
      this.handleNotification(notif);
    });
  }

  checkPersistentState() {
    // 1. Check for Active Trips
    const userId = this.authService.getUserId(); // Assuming this method exists or we get it from token
    if (userId) {
      this.tripService.getTrips('', userId).subscribe({
        next: (trips) => {
          const active = trips.trips.find(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
          if (active) {
            this.loadTrip(active.tripId);
          } else {
            this.checkPendingRequest();
          }
        },
        error: (err) => {
          console.error('Failed to fetch trips', err);
          this.checkPendingRequest();
        }
      });
    } else {
      this.checkPendingRequest();
    }
  }

  checkPendingRequest() {
    const pending = localStorage.getItem('lastmile_rider_pending');
    if (pending) {
      const timestamp = parseInt(pending, 10);
      const diff = Date.now() - timestamp;
      // Expire after 10 minutes
      if (diff < 10 * 60 * 1000) {
        this.dashboardState = 'PENDING';
      } else {
        localStorage.removeItem('lastmile_rider_pending');
        this.dashboardState = 'IDLE';
      }
    } else {
      this.dashboardState = 'IDLE';
    }
  }

  ngOnDestroy(): void {
    if (this.notifSubscription) {
      this.notifSubscription.unsubscribe();
    }
    if (this.locSubscription) {
      this.locSubscription.unsubscribe();
    }
  }

  loadAreas() {
    this.stationService.listAreas().subscribe({
      next: (areas) => {
        this.stations = areas.filter(a => a.isStation);
        this.destinations = areas;
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (this.rideForm.valid) {
      this.loading = true;
      const { stationId, destinationId, partySize, offsetMinutes } = this.rideForm.value;
      const userId = this.authService.getUserId();
      if (!userId) return;

      const now = new Date();
      const arrivalTime = new Date(now.getTime() + offsetMinutes * 60000);

      this.riderService.registerRideIntent(userId, stationId, destinationId, arrivalTime, partySize).subscribe({
        next: (res) => {
          this.snackBar.open('Ride Request Sent! Waiting for a driver...', 'Close', { duration: 5000 });
          this.loading = false;

          // Set Pending State
          this.dashboardState = 'PENDING';
          localStorage.setItem('lastmile_rider_pending', Date.now().toString());
        },
        error: (err) => {
          this.snackBar.open('Failed to request ride', 'Close', { duration: 3000 });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  cancelRequest() {
    const userId = this.authService.getUserId();

    // If we have an active trip, cancel it directly
    if (this.activeTrip) {
      this.tripService.updateTripStatus(this.activeTrip.tripId, 'CANCELLED').subscribe({
        next: () => {
          this.snackBar.open('Trip Cancelled', 'Close', { duration: 3000 });
          this.dashboardState = 'IDLE';
          this.activeTrip = null;
          this.driverLocation = null;
          this.driverProfile = null;
          if (this.locSubscription) this.locSubscription.unsubscribe();
        },
        error: (err) => {
          console.error('Failed to cancel trip', err);
          this.snackBar.open('Failed to cancel trip', 'Close', { duration: 3000 });
        }
      });
      return;
    }

    // Otherwise cancel the intent
    const stationId = this.rideForm.get('stationId')?.value;

    if (userId && stationId) {
      this.matchingService.cancelRideIntent(userId, stationId).subscribe({
        next: (res) => {
          this.snackBar.open('Request Cancelled', 'Close', { duration: 2000 });
          localStorage.removeItem('lastmile_rider_pending');
          this.dashboardState = 'IDLE';
        },
        error: (err) => {
          console.error('Failed to cancel intent', err);
          // Fallback to client-side clear
          localStorage.removeItem('lastmile_rider_pending');
          this.dashboardState = 'IDLE';
        }
      });
    } else {
      // Fallback
      localStorage.removeItem('lastmile_rider_pending');
      this.dashboardState = 'IDLE';
      this.snackBar.open('Request Cancelled', 'Close', { duration: 2000 });
    }
  }

  getAreaName(id: string): string {
    const area = this.destinations.find(a => a.id === id);
    return area ? area.name : id;
  }

  handleNotification(notif: any) {
    console.log('Received notification:', notif);

    // Safeguard: Ignore old notifications (e.g., > 5 mins old) if timestamp is available
    // Note: ts-proto might not map createdAt if it's not in the proto or if it's a Timestamp object
    // For now, we rely on the backend fix, but we can also check if the trip is already completed.

    this.snackBar.open(`Notification: ${notif.body}`, 'Close', { duration: 5000 });

    let tripId: string | null = null;
    if (notif.metadata) {
      tripId = notif.metadata['tripId'];
    }

    if (tripId) {
      console.log('Trip ID found in notification:', tripId);
      this.loadTrip(tripId);
    }
  }

  loadTrip(tripId: string) {
    console.log('Loading trip:', tripId);
    this.tripService.getTrip(tripId).subscribe({
      next: (trip) => {
        console.log('Trip loaded:', trip);

        if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
          this.dashboardState = 'IDLE';
          this.activeTrip = null;
          this.driverLocation = null;
          this.driverProfile = null;
          if (this.locSubscription) this.locSubscription.unsubscribe();
          this.snackBar.open('Trip Ended', 'Close', { duration: 5000 });
          return;
        }

        this.activeTrip = trip;
        this.dashboardState = 'TRIP';
        localStorage.removeItem('lastmile_rider_pending'); // Clear pending state
        this.startTrackingDriver(trip.driverId);

        // Fetch Driver Details
        this.driverGrpcService.getDriverProfile(trip.driverId).subscribe({
          next: (profile) => {
            this.driverProfile = profile;
            // Fetch driver name
            this.userService.getUser(profile.userId).subscribe(user => {
              this.driverName = user.name;
            });
          },
          error: (err) => console.error('Failed to load driver profile', err)
        });
      },
      error: (err) => console.error('Failed to load trip', err)
    });
  }

  startTrackingDriver(driverId: string) {
    if (this.locSubscription) this.locSubscription.unsubscribe();

    // Poll every 5 seconds
    // Subscribe to driver location stream
    this.locSubscription = this.locationService.subscribeDriverUpdates(driverId).subscribe({
      next: (loc) => {
        this.driverLocation = loc;
      },
      error: (err) => {
        console.error('Location stream error', err);
        // Fallback to polling or retry logic could be added here if needed
      }
    });
  }
}
