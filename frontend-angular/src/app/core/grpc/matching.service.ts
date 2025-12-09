import { Injectable, NgZone } from '@angular/core';
import { MatchingServiceClient } from '../../../proto/matching_pb_service';
import { SubscribeRequest, MatchEvent, AddRiderIntentRequest, AddRiderIntentResponse, EvaluateDriverRequest, MatchResponse } from '../../../proto/matching_pb';
import { AuthService } from '../auth/auth.service';
import { Subject, Observable } from 'rxjs';
import { GRPC_URL } from './grpc-clients.module';

@Injectable({
    providedIn: 'root'
})
export class MatchingGrpcService {
    private client: MatchingServiceClient;
    private matchEventsSubject = new Subject<MatchEvent.AsObject>();
    public matchEvents$ = this.matchEventsSubject.asObservable();

    constructor(
        private authService: AuthService,
        private ngZone: NgZone
    ) {
        this.client = new MatchingServiceClient(GRPC_URL);
    }

    subscribeMatches(stationAreaId: string) {
        const req = new SubscribeRequest();
        req.setClientId(this.authService.getUserId() || '');

        const stream = this.client.subscribeMatches(req, this.authService.getMetadata());

        stream.on('data', (event: MatchEvent) => {
            this.ngZone.run(() => {
                this.matchEventsSubject.next(event.toObject());
            });
        });

        stream.on('status', (status) => {
            console.log('Matching stream status:', status);
        });

        stream.on('end', (status) => {
            console.log('Matching stream ended', status);
        });
    }

    addRiderIntent(req: AddRiderIntentRequest): Observable<AddRiderIntentResponse> {
        return new Observable(observer => {
            this.client.addRiderIntent(req, this.authService.getMetadata(), (err, response) => {
                if (err) {
                    observer.error(err);
                } else if (response) {
                    observer.next(response);
                    observer.complete();
                }
            });
        });
    }

    evaluateDriver(req: EvaluateDriverRequest): Observable<MatchResponse> {
        return new Observable(observer => {
            this.client.evaluateDriver(req, this.authService.getMetadata(), (err, response) => {
                if (err) {
                    observer.error(err);
                } else if (response) {
                    observer.next(response);
                    observer.complete();
                }
            });
        });
    }
}
