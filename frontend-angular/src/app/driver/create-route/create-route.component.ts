import { Component, OnInit } from '@angular/core';
import { StationService } from '../../core/grpc/station.service';
import { Area } from '../../../proto/common_pb';
import { DriverGrpcService } from '../driver-grpc.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouteStop } from '../../../proto/driver_pb';

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
  allAreas: Area.AsObject[] = [];
  selectedStops: RouteStopItem[] = [];
  availableNextStops: Area.AsObject[] = [];

  constructor(
    private stationService: StationService,
    private driverService: DriverGrpcService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.stationService.listAreas().subscribe({
      next: (areas) => {
        this.allAreas = areas;
        this.availableNextStops = areas; // Initially all areas are available for first stop
      },
      error: (err) => console.error(err)
    });
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
        const edge = prevArea.neighboursList.find(n => n.toAreaId === areaId);
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

  updateAvailableNextStops(currentArea: Area.AsObject) {
    // Filter allAreas to only include neighbors of currentArea
    const neighborIds = currentArea.neighboursList.map(n => n.toAreaId);
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

    const stops: RouteStop[] = this.selectedStops.map((s, index) => {
      const stop = new RouteStop();
      stop.setSequence(index);
      stop.setAreaId(s.areaId);
      stop.setIsStation(s.isStation);
      stop.setArrivalOffsetMinutes(s.arrivalOffset);
      return stop;
    });

    this.driverService.registerRoute(stops).subscribe({
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
