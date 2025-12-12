import { Injectable } from '@angular/core';
import { DriverServiceClientImpl, RegisterDriverRequest, DriverProfile, RegisterRouteRequest, UpdateRouteRequest, UpdatePickupRequest, DriverId, RoutePlan, RouteStop } from '../../proto/driver';
import { UserId } from '../../proto/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';
import { GrpcWebRpc } from '../core/grpc/grpc-web-rpc';
import { GRPC_URL } from '../core/grpc/grpc-clients.module';

@Injectable({
    providedIn: 'root'
})
export class DriverGrpcService {

    private driverClient: DriverServiceClientImpl;

    constructor(private authService: AuthService) {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.driverClient = new DriverServiceClientImpl(rpc);
    }

    registerDriver(userId: string, vehicleNo: string, capacity: number, model: string, color: string): Observable<DriverProfile> {
        const req: RegisterDriverRequest = {
            userId,
            vehicleNo,
            capacity,
            model,
            color
        };

        return from(this.driverClient.RegisterDriver(req));
    }

    getDriverProfile(driverId: string): Observable<DriverProfile> {
        const req: DriverId = { id: driverId };
        return from(this.driverClient.GetDriver(req));
    }

    getDriverByUserId(userId: string): Observable<DriverProfile> {
        const req: UserId = { id: userId };
        return from(this.driverClient.GetDriverByUserId(req));
    }

    registerRoute(driverId: string, stops: RouteStop[]): Observable<RoutePlan> {
        const req: RegisterRouteRequest = {
            driverId,
            stops
        };

        return from(this.driverClient.RegisterRoute(req));
    }

    updateRoute(driverId: string, routeId: string, stops: RouteStop[]): Observable<RoutePlan> {
        const req: UpdateRouteRequest = {
            driverId,
            routeId,
            stops
        };

        return from(this.driverClient.UpdateRoute(req));
    }

    updatePickup(driverId: string, routeId: string, pickingUp: boolean): Observable<boolean> {
        const req: UpdatePickupRequest = {
            driverId,
            routeId,
            pickingUp
        };

        return from(this.driverClient.UpdatePickupStatus(req)).pipe(
            map(res => res.ok)
        );
    }
}
