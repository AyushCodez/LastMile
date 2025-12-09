import { Component, OnInit } from '@angular/core';
import { RiderGrpcService } from '../rider-grpc.service';
import { RideStatus } from '../../../proto/rider_pb';
import { StationService } from '../../core/grpc/station.service';

@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.component.html',
  styleUrls: ['./ride-history.component.scss']
})
export class RideHistoryComponent implements OnInit {
  rides: RideStatus.AsObject[] = [];
  loading = false;
  areas: Map<string, string> = new Map();

  constructor(
    private riderService: RiderGrpcService,
    private stationService: StationService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.stationService.listAreas().subscribe(areas => {
      areas.forEach(a => this.areas.set(a.id, a.name));
      this.loadHistory();
    });
  }

  loadHistory() {
    this.riderService.getRideHistory().subscribe({
      next: (res) => {
        this.rides = res.ridesList;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
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
}
