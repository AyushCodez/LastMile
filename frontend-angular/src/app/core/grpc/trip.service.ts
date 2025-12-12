import { Injectable } from '@angular/core';
import { TripServiceClientImpl, Trip, CreateTripRequest, UpdateTripRequest, TripId, GetTripsRequest, GetTripsResponse } from '../../../proto/trip';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { GrpcWebRpc } from './grpc-web-rpc';
import { GRPC_URL } from './grpc-clients.module';

@Injectable({
    providedIn: 'root'
})
export class TripGrpcService {

    private tripClient: TripServiceClientImpl;

    constructor(private authService: AuthService) {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.tripClient = new TripServiceClientImpl(rpc);
    }

    createTrip(driverId: string, routeId: string, stationAreaId: string, riderIds: string[], destinationAreaId: string, passengerCount: number, scheduledDeparture?: Date): Observable<Trip> {
        const req: CreateTripRequest = {
            driverId,
            routeId,
            stationAreaId,
            riderIds,
            destinationAreaId,
            passengerCount,
            scheduledDeparture
        };

        return from(this.tripClient.CreateTrip(req));
    }

    updateTripStatus(tripId: string, status: string): Observable<Trip> {
        const req: UpdateTripRequest = { tripId, status };
        return from(this.tripClient.UpdateTripStatus(req));
    }

    getTrip(tripId: string): Observable<Trip> {
        const req: TripId = { id: tripId };
        return from(this.tripClient.GetTrip(req));
    }

    getTrips(driverId: string, riderId: string): Observable<GetTripsResponse> {
        const req: GetTripsRequest = { driverId, riderId };
        return from(this.tripClient.GetTrips(req));
    }
}

