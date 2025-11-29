// package: lastmile.location
// file: location.proto

import * as location_pb from "./location_pb";
import {grpc} from "@improbable-eng/grpc-web";

type LocationServiceStreamDriverTelemetry = {
  readonly methodName: string;
  readonly service: typeof LocationService;
  readonly requestStream: true;
  readonly responseStream: false;
  readonly requestType: typeof location_pb.DriverTelemetry;
  readonly responseType: typeof location_pb.Ack;
};

type LocationServiceGetDriverSnapshot = {
  readonly methodName: string;
  readonly service: typeof LocationService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof location_pb.DriverId;
  readonly responseType: typeof location_pb.DriverSnapshot;
};

type LocationServiceGetDriverEta = {
  readonly methodName: string;
  readonly service: typeof LocationService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof location_pb.DriverEtaRequest;
  readonly responseType: typeof location_pb.DriverEta;
};

export class LocationService {
  static readonly serviceName: string;
  static readonly StreamDriverTelemetry: LocationServiceStreamDriverTelemetry;
  static readonly GetDriverSnapshot: LocationServiceGetDriverSnapshot;
  static readonly GetDriverEta: LocationServiceGetDriverEta;
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

export class LocationServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  streamDriverTelemetry(metadata?: grpc.Metadata): RequestStream<location_pb.DriverTelemetry>;
  getDriverSnapshot(
    requestMessage: location_pb.DriverId,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: location_pb.DriverSnapshot|null) => void
  ): UnaryResponse;
  getDriverSnapshot(
    requestMessage: location_pb.DriverId,
    callback: (error: ServiceError|null, responseMessage: location_pb.DriverSnapshot|null) => void
  ): UnaryResponse;
  getDriverEta(
    requestMessage: location_pb.DriverEtaRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: location_pb.DriverEta|null) => void
  ): UnaryResponse;
  getDriverEta(
    requestMessage: location_pb.DriverEtaRequest,
    callback: (error: ServiceError|null, responseMessage: location_pb.DriverEta|null) => void
  ): UnaryResponse;
}

