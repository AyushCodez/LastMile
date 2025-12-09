import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverGrpcService } from '../driver-grpc.service';
import { LocationGrpcService } from '../../core/grpc/location.service';
import { TripGrpcService } from '../../core/grpc/trip.service';
import { NotificationService } from '../../core/grpc/notification.service';
import { MatchingGrpcService } from '../../core/grpc/matching.service';
import { DriverProfile, RoutePlan } from '../../../proto/driver_pb';
import { EvaluateDriverRequest } from '../../../proto/matching_pb';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { StationService } from '../../core/grpc/station.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  driverProfile: DriverProfile.AsObject | null = null;
  activeRoute: RoutePlan.AsObject | null = null;
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
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Connect to notifications
    this.notificationService.connect();
    this.notifSubscription = this.notificationService.notifications$.subscribe(notif => {
      this.handleNotification(notif);
    });

    // Connect to matching events
    this.matchSubscription = this.matchingService.matchEvents$.subscribe(event => {
      if (event.eventId.startsWith('new-rider')) {
        // Check if this event is for our current station
        if (this.activeRoute && this.activeRoute.stopsList[this.currentStopIndex].areaId === event.stationAreaId) {
          // New rider arrived at station.
          // If we are at that station, we should refresh or show alert.
          // For now, just show a generic alert to check for riders.
          this.snackBar.open('New rider waiting at ' + this.getAreaName(event.stationAreaId), 'Check', { duration: 5000 })
            .onAction().subscribe(() => {
              this.checkMatches();
            });
        }
      }
    });

    // Load areas for names
    this.stationService.listAreas().subscribe(areas => {
      areas.forEach(a => this.areas.set(a.id, a.name));
    });

    // Load profile
    this.driverService.getDriverProfile().subscribe({
      next: (profile) => {
        this.driverProfile = profile;
        this.checkActiveRoute();
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      }
    });
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
        const route = this.driverProfile.routesList.find(r => r.routeId === routeId);
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

    const currentStop = this.activeRoute.stopsList[this.currentStopIndex];

    this.locationService.updateDriverLocation(
      this.driverProfile.driverId,
      this.activeRoute.routeId,
      currentStop.areaId,
      this.occupancy
    ).subscribe();

    // Also subscribe to matching events for this station
    this.matchingService.subscribeMatches(currentStop.areaId);
  }

  checkMatches() {
    if (!this.driverProfile || !this.activeRoute) return;
    const currentStop = this.activeRoute.stopsList[this.currentStopIndex];
    // Determine destination (next stop or final?)
    // For now, let's assume destination is the next stop or the end of route.
    // Actually, matching service takes destinationAreaId.
    // We should probably pass the *next* stop as destination? Or let the service decide?
    // Let's pass the next stop's area ID if available.
    let destAreaId = '';
    if (this.currentStopIndex < this.activeRoute.stopsList.length - 1) {
      destAreaId = this.activeRoute.stopsList[this.currentStopIndex + 1].areaId;
    }

    const req = new EvaluateDriverRequest();
    req.setDriverId(this.driverProfile.driverId);
    req.setRouteId(this.activeRoute.routeId);
    req.setStationAreaId(currentStop.areaId);
    req.setDestinationAreaId(destAreaId);
    req.setSeatsAvailable(4 - this.occupancy);
    req.setEtaToStationMinutes(0); // Assuming we are there or close

    this.matchingService.evaluateDriver(req).subscribe({
      next: (resp) => {
        if (resp.getMatched()) {
          this.snackBar.open(resp.getMsg(), 'Close', { duration: 5000 });
          // If matched, we should probably refresh or wait for notification?
          // The backend sends notification on match.
        } else {
          this.snackBar.open('No matches found: ' + resp.getMsg(), 'Close', { duration: 3000 });
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

      if (this.currentStopIndex >= this.activeRoute.stopsList.length) {
        this.endTrip();
      }
    } else {
      // Start moving to next stop
      if (this.currentStopIndex < this.activeRoute.stopsList.length - 1) {
        this.isMoving = true;
        // Maybe update location to indicate "en route"?
      } else {
        this.endTrip();
      }
    }
  }

  endTrip() {
    this.activeRoute = null;
    this.currentStopIndex = 0;
    this.isMoving = false;
    this.router.navigate(['/driver/select-route']);
    this.snackBar.open('Trip Ended', 'Close', { duration: 3000 });
  }

  handleNotification(notif: any) {
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
      destId,
      [riderId]
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
