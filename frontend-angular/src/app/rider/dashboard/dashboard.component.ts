import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StationService } from '../../core/grpc/station.service';
import { RiderGrpcService } from '../rider-grpc.service';
import { NotificationService } from '../../core/grpc/notification.service';
import { Area } from '../../../proto/common_pb';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  rideForm: FormGroup;
  stations: Area.AsObject[] = [];
  destinations: Area.AsObject[] = [];
  loading = false;
  private notifSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private stationService: StationService,
    private riderService: RiderGrpcService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
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
    this.notificationService.connect();
    this.notifSubscription = this.notificationService.notifications$.subscribe(notif => {
      this.handleNotification(notif);
    });
  }

  ngOnDestroy(): void {
    if (this.notifSubscription) {
      this.notifSubscription.unsubscribe();
    }
  }

  loadAreas() {
    this.stationService.listAreas().subscribe({
      next: (areas) => {
        this.stations = areas.filter(a => a.isStation);
        this.destinations = areas; // Can go anywhere? Or only non-stations? Assuming anywhere.
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
        },
        error: (err) => {
          this.snackBar.open('Failed to request ride', 'Close', { duration: 3000 });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  handleNotification(notif: any) {
    // Check if it's a match notification
    // Assuming body contains "Match found" or similar
    this.snackBar.open(`Notification: ${notif.body}`, 'Close', { duration: 10000 });
  }
}
