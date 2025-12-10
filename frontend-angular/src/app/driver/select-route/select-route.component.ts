import { Component, OnInit } from '@angular/core';
import { DriverGrpcService } from '../driver-grpc.service';
import { RoutePlan } from '../../../proto/driver';
import { Router } from '@angular/router';
import { StationService } from '../../core/grpc/station.service';
import { Area } from '../../../proto/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-select-route',
  templateUrl: './select-route.component.html',
  styleUrls: ['./select-route.component.scss']
})
export class SelectRouteComponent implements OnInit {
  routes: RoutePlan[] = [];
  loading = false;
  areas: Map<string, string> = new Map(); // ID -> Name

  constructor(
    private driverService: DriverGrpcService,
    private stationService: StationService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // Fetch areas for names
    this.stationService.listAreas().subscribe(areas => {
      areas.forEach(a => this.areas.set(a.id, a.name));
      this.loadRoutes();
    });
  }

  loadRoutes() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.driverService.getDriverByUserId(userId).subscribe({
        next: (profile) => {
          this.routes = profile.routes;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  selectRoute(route: RoutePlan) {
    // Navigate to dashboard with selected route ID or start trip logic
    // Usually we set the active route in a state/service or start the trip immediately.
    // The prompt says: "you can select the route you want to follow... set capacity... go into that trip"
    // So maybe we navigate to a "Start Trip" page or do it here.
    // I'll navigate to Dashboard with query param `routeId`.
    this.router.navigate(['/driver/dashboard'], { queryParams: { routeId: route.routeId } });
  }

  getRouteDescription(route: RoutePlan): string {
    if (route.stops.length === 0) return 'Empty Route';
    const first = this.areas.get(route.stops[0].areaId) || route.stops[0].areaId;
    const last = this.areas.get(route.stops[route.stops.length - 1].areaId) || route.stops[route.stops.length - 1].areaId;
    return `${first} to ${last} (${route.stops.length} stops)`;
  }
}
