import { Component, OnInit } from '@angular/core';
import { RiderGrpcService } from '../rider-grpc.service';
import { RideStatus } from '../../../proto/rider';
import { StationService } from '../../core/grpc/station.service';
import { TripGrpcService } from '../../core/grpc/trip.service';
import { DriverGrpcService } from '../../driver/driver-grpc.service';
import { Trip } from '../../../proto/trip';
import { DriverProfile } from '../../../proto/driver';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.component.html',
  styleUrls: ['./ride-history.component.scss']
})
export class RideHistoryComponent implements OnInit {
  rides: RideStatus[] = [];
  loading = false;
  areas: Map<string, string> = new Map();
  tripDetails: Map<string, Trip> = new Map();
  driverDetails: Map<string, DriverProfile> = new Map();
  selectedRide: RideStatus | null = null;

  constructor(
    private riderService: RiderGrpcService,
    private stationService: StationService,
    private tripService: TripGrpcService,
    private driverGrpcService: DriverGrpcService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.stationService.listAreas().subscribe(areas => {
      areas.forEach(a => this.areas.set(a.id, a.name));
      this.loadHistory();
    });
  }

  loadHistory() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.riderService.getRideHistory(userId).subscribe({
      next: (res) => {
        this.rides = res.rides;
        this.loading = false;
        this.loadDetails();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadDetails() {
    this.rides.forEach(ride => {
      if (ride.tripId) {
        this.tripService.getTrip(ride.tripId).subscribe(trip => {
          this.tripDetails.set(ride.intentId, trip);
          if (trip.driverId) {
            this.driverGrpcService.getDriverProfile(trip.driverId).subscribe(driver => {
              this.driverDetails.set(ride.intentId, driver);
            });
          }
        });
      }
    });
  }

  getAreaName(id: string): string {
    return this.areas.get(id) || id;
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Scheduled';
      case 2: return 'Picked Up';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  selectRide(ride: RideStatus) {
    this.selectedRide = this.selectedRide === ride ? null : ride;
  }
}
