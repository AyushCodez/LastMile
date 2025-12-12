import { Injectable } from '@angular/core';
import { LocationServiceClientImpl, DriverTelemetry, DriverSnapshot, DriverEtaRequest, DriverEta, DriverId } from '../../../proto/location';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { GrpcWebRpc } from './grpc-web-rpc';
import { GRPC_URL } from './grpc-clients.module';
import * as grpcWeb from 'grpc-web';

@Injectable({
    providedIn: 'root'
})
export class LocationGrpcService {

    private locationClient: LocationServiceClientImpl;

    constructor(private authService: AuthService) {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.locationClient = new LocationServiceClientImpl(rpc);
    }

    updateDriverLocation(driverId: string, routeId: string, currentAreaId: string, occupancy: number): Observable<void> {
        const req: DriverTelemetry = {
            driverId,
            routeId,
            currentAreaId,
            occupancy,
            ts: undefined // Timestamp handling if needed
        };

        return from(this.locationClient.UpdateDriverLocation(req)).pipe(
            map(() => { })
        );
    }

    getDriverSnapshot(driverId: string): Observable<DriverSnapshot> {
        const req: DriverId = { id: driverId };
        return from(this.locationClient.GetDriverSnapshot(req));
    }

    subscribeDriverUpdates(driverId: string): Observable<DriverSnapshot> {
        const req: DriverId = { id: driverId };
        return this.locationClient.SubscribeDriverUpdates(req);
    }
}
