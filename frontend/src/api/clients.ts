import * as UserPbService from '../proto/user_pb_service';
import * as RiderPbService from '../proto/rider_pb_service';
import * as DriverPbService from '../proto/driver_pb_service';
import * as LocationPbService from '../proto/location_pb_service';
import * as MatchingPbService from '../proto/matching_pb_service';
import * as TripPbService from '../proto/trip_pb_service';
import * as NotificationPbService from '../proto/notification_pb_service';

const ENVOY_URL = 'http://localhost:8080';

export const userClient = new UserPbService.UserServiceClient(ENVOY_URL);
export const riderClient = new RiderPbService.RiderServiceClient(ENVOY_URL);
export const driverClient = new DriverPbService.DriverServiceClient(ENVOY_URL);
export const locationClient = new LocationPbService.LocationServiceClient(ENVOY_URL);
export const matchingClient = new MatchingPbService.MatchingServiceClient(ENVOY_URL);
export const tripClient = new TripPbService.TripServiceClient(ENVOY_URL);
export const notificationClient = new NotificationPbService.NotificationServiceClient(ENVOY_URL);
