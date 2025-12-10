import { Injectable, NgZone } from '@angular/core';
import { NotificationServiceClientImpl, Notification, SubscribeRequest, Ack } from '../../../proto/notification';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { GrpcWebRpc } from './grpc-web-rpc';
import { GRPC_URL } from './grpc-clients.module';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationClient: NotificationServiceClientImpl;

    constructor(
        private authService: AuthService,
        private ngZone: NgZone
    ) {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.notificationClient = new NotificationServiceClientImpl(rpc);
    }

    subscribe(): Observable<Notification> {
        const userId = this.authService.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const req: SubscribeRequest = { userId };

        return new Observable<Notification>((observer) => {
            const stream = this.notificationClient.Subscribe(req);
            const subscription = stream.subscribe({
                next: (notification) => {
                    this.ngZone.run(() => observer.next(notification));
                },
                error: (err) => {
                    this.ngZone.run(() => observer.error(err));
                },
                complete: () => {
                    this.ngZone.run(() => observer.complete());
                }
            });

            return () => subscription.unsubscribe();
        });
    }
}

