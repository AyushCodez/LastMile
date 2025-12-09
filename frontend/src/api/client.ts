import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { UserServiceClient } from '../proto/user.client';
import { RiderServiceClient } from '../proto/rider.client';
import { DriverServiceClient } from '../proto/driver.client';
import { StationServiceClient } from '../proto/station.client';
import { TripServiceClient } from '../proto/trip.client';
import { NotificationServiceClient } from '../proto/notification.client';
import { LocationServiceClient } from '../proto/location.client';

const transport = new GrpcWebFetchTransport({
    baseUrl: 'http://localhost:8090'
});

export const userClient = new UserServiceClient(transport);
export const riderClient = new RiderServiceClient(transport);
export const driverClient = new DriverServiceClient(transport);
export const stationClient = new StationServiceClient(transport);
export const tripClient = new TripServiceClient(transport);
export const notificationClient = new NotificationServiceClient(transport);
export const locationClient = new LocationServiceClient(transport);
