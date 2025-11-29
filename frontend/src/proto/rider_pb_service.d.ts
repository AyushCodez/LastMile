// package: lastmile.rider
// file: rider.proto

import * as rider_pb from "./rider_pb";
import {grpc} from "@improbable-eng/grpc-web";

type RiderServiceRegisterRideIntent = {
  readonly methodName: string;
  readonly service: typeof RiderService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof rider_pb.RegisterRideIntentRequest;
  readonly responseType: typeof rider_pb.RideIntentResponse;
};

type RiderServiceGetRideStatus = {
  readonly methodName: string;
  readonly service: typeof RiderService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof rider_pb.RideId;
  readonly responseType: typeof rider_pb.RideStatus;
};

export class RiderService {
  static readonly serviceName: string;
  static readonly RegisterRideIntent: RiderServiceRegisterRideIntent;
  static readonly GetRideStatus: RiderServiceGetRideStatus;
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

export class RiderServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  registerRideIntent(
    requestMessage: rider_pb.RegisterRideIntentRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: rider_pb.RideIntentResponse|null) => void
  ): UnaryResponse;
  registerRideIntent(
    requestMessage: rider_pb.RegisterRideIntentRequest,
    callback: (error: ServiceError|null, responseMessage: rider_pb.RideIntentResponse|null) => void
  ): UnaryResponse;
  getRideStatus(
    requestMessage: rider_pb.RideId,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: rider_pb.RideStatus|null) => void
  ): UnaryResponse;
  getRideStatus(
    requestMessage: rider_pb.RideId,
    callback: (error: ServiceError|null, responseMessage: rider_pb.RideStatus|null) => void
  ): UnaryResponse;
}

