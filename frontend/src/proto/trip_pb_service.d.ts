// package: lastmile.trip
// file: trip.proto

import * as trip_pb from "./trip_pb";
import {grpc} from "@improbable-eng/grpc-web";

type TripServiceCreateTrip = {
  readonly methodName: string;
  readonly service: typeof TripService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trip_pb.CreateTripRequest;
  readonly responseType: typeof trip_pb.Trip;
};

type TripServiceUpdateTripStatus = {
  readonly methodName: string;
  readonly service: typeof TripService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trip_pb.UpdateTripRequest;
  readonly responseType: typeof trip_pb.Trip;
};

type TripServiceGetTrip = {
  readonly methodName: string;
  readonly service: typeof TripService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trip_pb.TripId;
  readonly responseType: typeof trip_pb.Trip;
};

export class TripService {
  static readonly serviceName: string;
  static readonly CreateTrip: TripServiceCreateTrip;
  static readonly UpdateTripStatus: TripServiceUpdateTripStatus;
  static readonly GetTrip: TripServiceGetTrip;
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

export class TripServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  createTrip(
    requestMessage: trip_pb.CreateTripRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trip_pb.Trip|null) => void
  ): UnaryResponse;
  createTrip(
    requestMessage: trip_pb.CreateTripRequest,
    callback: (error: ServiceError|null, responseMessage: trip_pb.Trip|null) => void
  ): UnaryResponse;
  updateTripStatus(
    requestMessage: trip_pb.UpdateTripRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trip_pb.Trip|null) => void
  ): UnaryResponse;
  updateTripStatus(
    requestMessage: trip_pb.UpdateTripRequest,
    callback: (error: ServiceError|null, responseMessage: trip_pb.Trip|null) => void
  ): UnaryResponse;
  getTrip(
    requestMessage: trip_pb.TripId,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trip_pb.Trip|null) => void
  ): UnaryResponse;
  getTrip(
    requestMessage: trip_pb.TripId,
    callback: (error: ServiceError|null, responseMessage: trip_pb.Trip|null) => void
  ): UnaryResponse;
}

