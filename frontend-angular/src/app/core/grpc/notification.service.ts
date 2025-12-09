import { Injectable, NgZone } from '@angular/core';
import { NotificationServiceClient } from '../../../proto/notification_pb_service';
import { SubscribeRequest, Notification } from '../../../proto/notification_pb';
import { AuthService } from '../auth/auth.service';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new Subject<Notification.AsObject>();
    public notifications$ = this.notificationsSubject.asObservable();

    constructor(
        private notificationClient: NotificationServiceClient,
        private authService: AuthService,
        private ngZone: NgZone
    ) { }

    connect() {
        const userId = this.authService.getUserId();
        if (!userId) {
            console.warn('Cannot connect to notifications: No User ID');
            return;
        }

        const req = new SubscribeRequest();
        req.setUserId(userId);

        const stream = this.notificationClient.subscribe(req, this.authService.getMetadata());

        stream.on('data', (notification: Notification) => {
            this.ngZone.run(() => {
                this.notificationsSubject.next(notification.toObject());
            });
        });

        stream.on('status', (status) => {
            console.log('Notification stream status:', status);
        });

        stream.on('end', (status) => {
            console.log('Notification stream ended', status);
            if (status && status.code !== 0) {
                console.error('Notification stream error:', status.details);
            }
        });
    }
}
