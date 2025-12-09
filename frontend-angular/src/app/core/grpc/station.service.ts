import { Injectable } from '@angular/core';
import { StationServiceClient } from '../../../proto/station_pb_service';
import { ListAreasRequest, AreaList } from '../../../proto/station_pb';
import { Area } from '../../../proto/common_pb';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StationService {

    constructor(
        private stationClient: StationServiceClient,
        private authService: AuthService
    ) { }

    listAreas(): Observable<Area.AsObject[]> {
        const req = new ListAreasRequest();
        return new Observable<AreaList>((observer) => {
            this.stationClient.listAreas(req, this.authService.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject().itemsList));
    }
}
