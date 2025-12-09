import { Injectable } from '@angular/core';
import { DriverServiceClient } from '../../proto/driver_pb_service';
import { RegisterDriverRequest, DriverProfile, RegisterRouteRequest, RoutePlan, DriverId, RouteStop } from '../../proto/driver_pb';
import { UserId } from '../../proto/common_pb';
import { AuthService } from '../core/auth/auth.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DriverGrpcService {

    constructor(
        private driverClient: DriverServiceClient,
        private authService: AuthService
    ) { }

    registerDriver(vehicleNo: string, capacity: number, model: string, color: string): Observable<DriverProfile.AsObject> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User ID not found');

        const req = new RegisterDriverRequest();
        req.setUserId(userId);
        req.setVehicleNo(vehicleNo);
        req.setCapacity(capacity);
        req.setModel(model);
        req.setColor(color);

        return new Observable<DriverProfile>((observer) => {
            this.driverClient.registerDriver(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    getDriverProfile(): Observable<DriverProfile.AsObject> {
        const userIdStr = this.authService.getUserId();
        if (!userIdStr) throw new Error('User ID not found');

        const req = new UserId();
        req.setId(userIdStr);

        return new Observable<DriverProfile>((observer) => {
            this.driverClient.getDriverByUserId(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    registerRoute(stops: RouteStop[]): Observable<RoutePlan.AsObject> {
        return this.getDriverProfile().pipe(
            switchMap((profile: DriverProfile.AsObject) => {
                const req = new RegisterRouteRequest();
                req.setDriverId(profile.driverId);
                req.setStopsList(stops);

                return new Observable<RoutePlan>((observer) => {
                    this.driverClient.registerRoute(req, this.authService.getMetadata(), (err, res) => {
                        if (err) observer.error(err);
                        else if (res) {
                            observer.next(res);
                            observer.complete();
                        }
                    });
                });
            }),
            map(res => res.toObject())
        );
    }
}
