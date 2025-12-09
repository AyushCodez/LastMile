import { Injectable } from '@angular/core';
import { TripServiceClient } from '../../../proto/trip_pb_service';
import { CreateTripRequest, Trip, UpdateTripRequest, TripId, GetTripsRequest, GetTripsResponse } from '../../../proto/trip_pb';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

@Injectable({
    providedIn: 'root'
})
export class TripGrpcService {

    constructor(
        private tripClient: TripServiceClient,
        private authService: AuthService
    ) { }

    createTrip(driverId: string, routeId: string, stationAreaId: string, destinationAreaId: string, riderIds: string[]): Observable<Trip.AsObject> {
        const req = new CreateTripRequest();
        req.setDriverId(driverId);
        req.setRouteId(routeId);
        req.setStationAreaId(stationAreaId);
        req.setDestinationAreaId(destinationAreaId);
        req.setRiderIdsList(riderIds);

        // Scheduled departure - now?
        const ts = new Timestamp();
        const now = new Date();
        ts.setSeconds(Math.floor(now.getTime() / 1000));
        ts.setNanos((now.getTime() % 1000) * 1000000);
        req.setScheduledDeparture(ts);

        return new Observable<Trip>((observer) => {
            this.tripClient.createTrip(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    updateTripStatus(tripId: string, status: string): Observable<Trip.AsObject> {
        const req = new UpdateTripRequest();
        req.setTripId(tripId);
        req.setStatus(status);

        return new Observable<Trip>((observer) => {
            this.tripClient.updateTripStatus(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    getTrip(tripId: string): Observable<Trip.AsObject> {
        const req = new TripId();
        req.setId(tripId);

        return new Observable<Trip>((observer) => {
            this.tripClient.getTrip(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    getTrips(driverId: string = '', riderId: string = ''): Observable<Trip.AsObject[]> {
        const req = new GetTripsRequest();
        if (driverId) req.setDriverId(driverId);
        if (riderId) req.setRiderId(riderId);

        return new Observable<GetTripsResponse>((observer) => {
            this.tripClient.getTrips(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.getTripsList().map(t => t.toObject())));
    }
}
