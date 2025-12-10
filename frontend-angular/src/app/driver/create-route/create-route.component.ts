import { Component, OnInit } from '@angular/core';
import { StationService } from '../../core/grpc/station.service';
import { Area } from '../../../proto/common';
import { DriverGrpcService } from '../driver-grpc.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouteStop } from '../../../proto/driver';
import { AuthService } from '../../core/auth/auth.service';

interface RouteStopItem {
  areaId: string;
  isStation: boolean;
  arrivalOffset: number;
}

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrls: ['./create-route.component.scss']
})
export class CreateRouteComponent implements OnInit {
  allAreas: Area[] = [];
  selectedStops: RouteStopItem[] = [];
  availableNextStops: Area[] = [];
  driverId: string | null = null;

  constructor(
    private stationService: StationService,
    private driverService: DriverGrpcService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.stationService.listAreas().subscribe({
      next: (areas) => {
        this.allAreas = areas;
        this.availableNextStops = areas; // Initially all areas are available for first stop
      },
      error: (err) => console.error(err)
    });

    const userId = this.authService.getUserId();
    if (userId) {
      this.driverService.getDriverByUserId(userId).subscribe({
        next: (profile) => {
          this.driverId = profile.driverId;
        },
        error: (err) => {
          console.error('Driver profile not found', err);
          this.snackBar.open('Please register your vehicle first', 'Register', { duration: 5000 })
            .onAction().subscribe(() => {
              this.router.navigate(['/driver/vehicle']);
            });
          // Optional: Redirect immediately or disable form
          // this.router.navigate(['/driver/vehicle']);
        }
      });
    }
  }

  addStop(areaId: string) {
    const area = this.allAreas.find(a => a.id === areaId);
    if (!area) return;

    // Calculate offset based on travel time from previous stop
    let offset = 0;
    if (this.selectedStops.length > 0) {
      const prevStop = this.selectedStops[this.selectedStops.length - 1];
      const prevArea = this.allAreas.find(a => a.id === prevStop.areaId);
      if (prevArea) {
        const edge = prevArea.neighbours.find(n => n.toAreaId === areaId);
        if (edge) {
          offset = prevStop.arrivalOffset + edge.travelMinutes;
        }
      }
    }

    this.selectedStops.push({
      areaId: area.id,
      isStation: area.isStation,
      arrivalOffset: offset
    });

    this.updateAvailableNextStops(area);
  }

  updateAvailableNextStops(currentArea: Area) {
    // Filter allAreas to only include neighbors of currentArea
    const neighborIds = currentArea.neighbours.map(n => n.toAreaId);
    this.availableNextStops = this.allAreas.filter(a => neighborIds.includes(a.id));
  }

  reset() {
    this.selectedStops = [];
    this.availableNextStops = this.allAreas;
  }

  saveRoute() {
    if (this.selectedStops.length < 2) {
      this.snackBar.open('Route must have at least 2 stops', 'Close', { duration: 3000 });
      return;
    }

    const stops: RouteStop[] = this.selectedStops.map((s, index) => ({
      sequence: index,
      areaId: s.areaId,
      isStation: s.isStation,
      arrivalOffsetMinutes: s.arrivalOffset
    }));

    if (!this.driverId) {
      this.snackBar.open('Driver profile not loaded. Please register vehicle.', 'Close', { duration: 3000 });
      return;
    }

    this.driverService.registerRoute(this.driverId, stops).subscribe({
      next: (res) => {
        this.snackBar.open('Route saved successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/driver/select-route']);
      },
      error: (err) => {
        this.snackBar.open('Failed to save route', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  getAreaName(id: string): string {
    return this.allAreas.find(a => a.id === id)?.name || id;
  }
}
