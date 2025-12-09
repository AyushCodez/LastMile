import { Injectable } from '@angular/core';
import { RiderServiceClient } from '../../proto/rider_pb_service';
import { RegisterRideIntentRequest, RideIntentResponse, GetRideHistoryRequest, RideHistoryResponse } from '../../proto/rider_pb';
import { AuthService } from '../core/auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

@Injectable({
    providedIn: 'root'
})
export class RiderGrpcService {

    constructor(
        private riderClient: RiderServiceClient,
        private authService: AuthService
    ) { }

    registerRideIntent(stationId: string, destId: string, partySize: number, offsetMinutes: number): Observable<RideIntentResponse.AsObject> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User ID not found');

        const req = new RegisterRideIntentRequest();
        req.setUserId(userId);
        req.setStationAreaId(stationId);
        req.setDestinationAreaId(destId);
        req.setPartySize(partySize);

        const ts = new Timestamp();
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + offsetMinutes * 60000);
        ts.setSeconds(Math.floor(arrivalTime.getTime() / 1000));
        ts.setNanos((arrivalTime.getTime() % 1000) * 1000000);
        req.setArrivalTime(ts);

        return new Observable<RideIntentResponse>((observer) => {
            this.riderClient.registerRideIntent(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    getRideHistory(): Observable<RideHistoryResponse.AsObject> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User ID not found');

        const req = new GetRideHistoryRequest();
        req.setUserId(userId);

        return new Observable<RideHistoryResponse>((observer) => {
            this.riderClient.getRideHistory(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }
}
