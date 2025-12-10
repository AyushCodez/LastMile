import { Injectable, NgZone } from '@angular/core';
import { MatchingServiceClientImpl, AddRiderIntentRequest, CancelRideIntentRequest, EvaluateDriverRequest, MatchResponse, MatchEvent, SubscribeRequest } from '../../../proto/matching';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { GrpcWebRpc } from './grpc-web-rpc';
import { GRPC_URL } from './grpc-clients.module';
import * as grpcWeb from 'grpc-web'; // Keep this for stream status/end events if subscribeMatches is still using grpc-web stream

@Injectable({
    providedIn: 'root'
})
export class MatchingGrpcService {
    private matchEventsSubject = new BehaviorSubject<MatchEvent | null>(null); // Changed to BehaviorSubject, initialized with null
    public matchEvents$ = this.matchEventsSubject.asObservable();

    private matchingClient: MatchingServiceClientImpl;

    constructor(
        private authService: AuthService,
        private ngZone: NgZone
    ) {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.matchingClient = new MatchingServiceClientImpl(rpc);
    }

    // Assuming subscribeMatches will still use the grpc-web stream approach for now,
    // as the instruction snippet for it was incomplete and mixed with other methods.
    // If the new client supports streaming differently, this would need a full rewrite.
    subscribeMatches(stationIds: string[]) {
        const req: SubscribeRequest = {
            clientId: this.authService.getUserId() || '',
            stationIds: stationIds
        };

        this.matchingClient.SubscribeMatches(req).subscribe({
            next: (event: MatchEvent) => {
                this.ngZone.run(() => {
                    console.log('Received MatchEvent:', event);
                    this.matchEventsSubject.next(event);
                });
            },
            error: (err) => {
                console.error('Matching stream error:', err);
            },
            complete: () => {
                console.log('Matching stream ended');
            }
        });
    }

    addRiderIntent(riderId: string, stationAreaId: string, destinationAreaId: string, partySize: number): Observable<boolean> {
        const req: AddRiderIntentRequest = {
            riderId,
            stationAreaId,
            destinationAreaId,
            partySize,
            arrivalTime: undefined // Timestamp handling if needed
        };

        return from(this.matchingClient.AddRiderIntent(req)).pipe(
            map(res => res.success)
        );
    }

    evaluateDriver(req: EvaluateDriverRequest): Observable<MatchResponse> {
        return from(this.matchingClient.EvaluateDriver(req));
    }

    cancelRideIntent(riderId: string, stationAreaId: string): Observable<boolean> {
        const req: CancelRideIntentRequest = { riderId, stationAreaId };

        return from(this.matchingClient.CancelRideIntent(req)).pipe(
            map(res => res.success)
        );
    }
}

