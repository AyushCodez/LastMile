import { Injectable } from '@angular/core';
import { LocationServiceClient } from '../../../proto/location_pb_service';
import { DriverTelemetry, Ack, DriverSnapshot, DriverId } from '../../../proto/location_pb';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

@Injectable({
    providedIn: 'root'
})
export class LocationGrpcService {

    constructor(
        private locationClient: LocationServiceClient,
        private authService: AuthService
    ) { }

    updateDriverLocation(driverId: string, routeId: string, currentAreaId: string, occupancy: number): Observable<Ack.AsObject> {
        const req = new DriverTelemetry();
        req.setDriverId(driverId);
        req.setRouteId(routeId);
        req.setCurrentAreaId(currentAreaId);
        req.setOccupancy(occupancy);

        const ts = new Timestamp();
        const now = new Date();
        ts.setSeconds(Math.floor(now.getTime() / 1000));
        ts.setNanos((now.getTime() % 1000) * 1000000);
        req.setTs(ts);

        return new Observable<Ack>((observer) => {
            this.locationClient.updateDriverLocation(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    getDriverSnapshot(driverId: string): Observable<DriverSnapshot.AsObject> {
        const req = new DriverId();
        req.setId(driverId);

        return new Observable<DriverSnapshot>((observer) => {
            this.locationClient.getDriverSnapshot(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(d => d.toObject()));
    }
}
