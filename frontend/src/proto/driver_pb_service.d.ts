// package: lastmile.driver
// file: driver.proto

import * as driver_pb from "./driver_pb";
import {grpc} from "@improbable-eng/grpc-web";

type DriverServiceRegisterDriver = {
  readonly methodName: string;
  readonly service: typeof DriverService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof driver_pb.RegisterDriverRequest;
  readonly responseType: typeof driver_pb.DriverProfile;
};

type DriverServiceRegisterRoute = {
  readonly methodName: string;
  readonly service: typeof DriverService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof driver_pb.RegisterRouteRequest;
  readonly responseType: typeof driver_pb.RoutePlan;
};

type DriverServiceUpdateRoute = {
  readonly methodName: string;
  readonly service: typeof DriverService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof driver_pb.UpdateRouteRequest;
  readonly responseType: typeof driver_pb.RoutePlan;
};

type DriverServiceUpdatePickupStatus = {
  readonly methodName: string;
  readonly service: typeof DriverService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof driver_pb.UpdatePickupRequest;
  readonly responseType: typeof driver_pb.Ack;
};

type DriverServiceGetDriver = {
  readonly methodName: string;
  readonly service: typeof DriverService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof driver_pb.DriverId;
  readonly responseType: typeof driver_pb.DriverProfile;
};

export class DriverService {
  static readonly serviceName: string;
  static readonly RegisterDriver: DriverServiceRegisterDriver;
  static readonly RegisterRoute: DriverServiceRegisterRoute;
  static readonly UpdateRoute: DriverServiceUpdateRoute;
  static readonly UpdatePickupStatus: DriverServiceUpdatePickupStatus;
  static readonly GetDriver: DriverServiceGetDriver;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class DriverServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  registerDriver(
    requestMessage: driver_pb.RegisterDriverRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: driver_pb.DriverProfile|null) => void
  ): UnaryResponse;
  registerDriver(
    requestMessage: driver_pb.RegisterDriverRequest,
    callback: (error: ServiceError|null, responseMessage: driver_pb.DriverProfile|null) => void
  ): UnaryResponse;
  registerRoute(
    requestMessage: driver_pb.RegisterRouteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: driver_pb.RoutePlan|null) => void
  ): UnaryResponse;
  registerRoute(
    requestMessage: driver_pb.RegisterRouteRequest,
    callback: (error: ServiceError|null, responseMessage: driver_pb.RoutePlan|null) => void
  ): UnaryResponse;
  updateRoute(
    requestMessage: driver_pb.UpdateRouteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: driver_pb.RoutePlan|null) => void
  ): UnaryResponse;
  updateRoute(
    requestMessage: driver_pb.UpdateRouteRequest,
    callback: (error: ServiceError|null, responseMessage: driver_pb.RoutePlan|null) => void
  ): UnaryResponse;
  updatePickupStatus(
    requestMessage: driver_pb.UpdatePickupRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: driver_pb.Ack|null) => void
  ): UnaryResponse;
  updatePickupStatus(
    requestMessage: driver_pb.UpdatePickupRequest,
    callback: (error: ServiceError|null, responseMessage: driver_pb.Ack|null) => void
  ): UnaryResponse;
  getDriver(
    requestMessage: driver_pb.DriverId,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: driver_pb.DriverProfile|null) => void
  ): UnaryResponse;
  getDriver(
    requestMessage: driver_pb.DriverId,
    callback: (error: ServiceError|null, responseMessage: driver_pb.DriverProfile|null) => void
  ): UnaryResponse;
}

