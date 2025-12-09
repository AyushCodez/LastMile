import { NgModule } from '@angular/core';
import { UserServiceClient } from '../../../proto/user_pb_service';
import { DriverServiceClient } from '../../../proto/driver_pb_service';
import { RiderServiceClient } from '../../../proto/rider_pb_service';
import { TripServiceClient } from '../../../proto/trip_pb_service';
import { StationServiceClient } from '../../../proto/station_pb_service';
import { NotificationServiceClient } from '../../../proto/notification_pb_service';

import { LocationServiceClient } from '../../../proto/location_pb_service';
import { MatchingServiceClient } from '../../../proto/matching_pb_service';

export const GRPC_URL = 'http://localhost:8080';

@NgModule({
    providers: [
        { provide: UserServiceClient, useFactory: () => new UserServiceClient(GRPC_URL) },
        { provide: DriverServiceClient, useFactory: () => new DriverServiceClient(GRPC_URL) },
        { provide: RiderServiceClient, useFactory: () => new RiderServiceClient(GRPC_URL) },
        { provide: TripServiceClient, useFactory: () => new TripServiceClient(GRPC_URL) },
        { provide: StationServiceClient, useFactory: () => new StationServiceClient(GRPC_URL) },
        { provide: NotificationServiceClient, useFactory: () => new NotificationServiceClient(GRPC_URL) },
        { provide: LocationServiceClient, useFactory: () => new LocationServiceClient(GRPC_URL) },
        { provide: MatchingServiceClient, useFactory: () => new MatchingServiceClient(GRPC_URL) },
    ]
})
export class GrpcClientsModule { }
