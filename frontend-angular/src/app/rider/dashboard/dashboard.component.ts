import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StationService } from '../../core/grpc/station.service';
import { RiderGrpcService } from '../rider-grpc.service';
import { NotificationService } from '../../core/grpc/notification.service';
import { TripGrpcService } from '../../core/grpc/trip.service';
import { LocationGrpcService } from '../../core/grpc/location.service';
import { Area } from '../../../proto/common_pb';
import { Trip } from '../../../proto/trip_pb';
import { DriverSnapshot } from '../../../proto/location_pb';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  rideForm: FormGroup;
  stations: Area.AsObject[] = [];
  destinations: Area.AsObject[] = [];
  dashboardState: 'IDLE' | 'PENDING' | 'TRIP' = 'IDLE';
  loading = false;
  activeTrip: Trip.AsObject | null = null;
  driverLocation: DriverSnapshot.AsObject | null = null;

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
    private authService: import('../../core/auth/auth.service').AuthService // Need auth to get my ID
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

    this.notificationService.connect();
    this.notifSubscription = this.notificationService.notifications$.subscribe(notif => {
      this.handleNotification(notif);
    });
  }

  checkPersistentState() {
    // 1. Check for Active Trips
    const userId = this.authService.getUserId(); // Assuming this method exists or we get it from token
    if (userId) {
      this.tripService.getTrips('', userId).subscribe({
        next: (trips) => {
          const active = trips.find(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
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
      this.riderService.registerRideIntent(stationId, destinationId, partySize, offsetMinutes).subscribe({
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
    // Client-side cancellation only (since backend doesn't support explicit cancel intent yet)
    localStorage.removeItem('lastmile_rider_pending');
    this.dashboardState = 'IDLE';
    this.snackBar.open('Request Cancelled', 'Close', { duration: 2000 });
  }

  handleNotification(notif: any) {
    console.log('Received notification:', notif);
    this.snackBar.open(`Notification: ${notif.body}`, 'Close', { duration: 5000 });

    // Check for tripId in metadata
    if (notif.metadataMap && notif.metadataMap.has('tripId')) {
      const tripId = notif.metadataMap.get('tripId');
      console.log('Trip ID found in notification:', tripId);
      this.loadTrip(tripId);
    }
  }

  loadTrip(tripId: string) {
    console.log('Loading trip:', tripId);
    this.tripService.getTrip(tripId).subscribe({
      next: (trip) => {
        console.log('Trip loaded:', trip);
        this.activeTrip = trip;
        this.dashboardState = 'TRIP';
        localStorage.removeItem('lastmile_rider_pending'); // Clear pending state
        this.startTrackingDriver(trip.driverId);
      },
      error: (err) => console.error('Failed to load trip', err)
    });
  }

  startTrackingDriver(driverId: string) {
    if (this.locSubscription) this.locSubscription.unsubscribe();

    // Poll every 5 seconds
    this.locSubscription = timer(0, 5000).pipe(
      switchMap(() => this.locationService.getDriverSnapshot(driverId))
    ).subscribe({
      next: (loc) => {
        this.driverLocation = loc;
      },
      error: (err) => console.error('Loc poll error', err)
    });
  }
}
