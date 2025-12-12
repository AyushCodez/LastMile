import { Injectable } from '@angular/core';
import { UserServiceClientImpl, UserProfile } from '../../../proto/user';
import { UserId } from '../../../proto/common';
import { Observable, from } from 'rxjs';
import { GrpcWebRpc } from './grpc-web-rpc';
import { GRPC_URL } from './grpc-clients.module';

@Injectable({
    providedIn: 'root'
})
export class UserGrpcService {

    private userClient: UserServiceClientImpl;

    constructor() {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.userClient = new UserServiceClientImpl(rpc);
    }

    getUser(userId: string): Observable<UserProfile> {
        const req: UserId = { id: userId };
        return from(this.userClient.GetUser(req));
    }
}
