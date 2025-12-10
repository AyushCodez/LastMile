import { Injectable } from '@angular/core';
import { RiderServiceClientImpl, RegisterRideIntentRequest, RideIntentResponse, RideStatus, GetRideHistoryRequest, RideHistoryResponse, RideId } from '../../proto/rider';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';
import { GrpcWebRpc } from '../core/grpc/grpc-web-rpc';
import { GRPC_URL } from '../core/grpc/grpc-clients.module';
import * as grpcWeb from 'grpc-web';

@Injectable({
    providedIn: 'root'
})
export class RiderGrpcService {

    private riderClient: RiderServiceClientImpl;

    constructor(private authService: AuthService) {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.riderClient = new RiderServiceClientImpl(rpc);
    }

    registerRideIntent(userId: string, stationAreaId: string, destinationAreaId: string, arrivalTime: Date, partySize: number): Observable<RideIntentResponse> {
        const req: RegisterRideIntentRequest = {
            userId,
            stationAreaId,
            destinationAreaId,
            arrivalTime,
            partySize
        };

        return from(this.riderClient.RegisterRideIntent(req));
    }

    getRideStatus(rideId: string): Observable<RideStatus> {
        const req: RideId = { id: rideId };
        return from(this.riderClient.GetRideStatus(req));
    }

    getRideHistory(userId: string): Observable<RideHistoryResponse> {
        const req: GetRideHistoryRequest = { userId };
        return from(this.riderClient.GetRideHistory(req));
    }
}
