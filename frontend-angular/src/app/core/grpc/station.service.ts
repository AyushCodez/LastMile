import { Injectable } from '@angular/core';
import { StationServiceClientImpl, ListAreasRequest, AreaList } from '../../../proto/station';
import { Area } from '../../../proto/common';
import { AuthService } from '../auth/auth.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { GrpcWebRpc } from './grpc-web-rpc';
import { GRPC_URL } from './grpc-clients.module';

@Injectable({
    providedIn: 'root'
})
export class StationService {

    private stationClient: StationServiceClientImpl;

    constructor(private authService: AuthService) {
        const rpc = new GrpcWebRpc(GRPC_URL);
        this.stationClient = new StationServiceClientImpl(rpc);
    }

    listAreas(): Observable<Area[]> {
        const req: ListAreasRequest = {};
        return from(this.stationClient.ListAreas(req)).pipe(
            map(res => res.items)
        );
    }
}
