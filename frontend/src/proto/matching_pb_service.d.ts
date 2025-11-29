// package: lastmile.matching
// file: matching.proto

import * as matching_pb from "./matching_pb";
import {grpc} from "@improbable-eng/grpc-web";

type MatchingServiceEvaluateDriver = {
  readonly methodName: string;
  readonly service: typeof MatchingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof matching_pb.EvaluateDriverRequest;
  readonly responseType: typeof matching_pb.MatchResponse;
};

type MatchingServiceSubscribeMatches = {
  readonly methodName: string;
  readonly service: typeof MatchingService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof matching_pb.SubscribeRequest;
  readonly responseType: typeof matching_pb.MatchEvent;
};

type MatchingServiceAddRiderIntent = {
  readonly methodName: string;
  readonly service: typeof MatchingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof matching_pb.AddRiderIntentRequest;
  readonly responseType: typeof matching_pb.AddRiderIntentResponse;
};

export class MatchingService {
  static readonly serviceName: string;
  static readonly EvaluateDriver: MatchingServiceEvaluateDriver;
  static readonly SubscribeMatches: MatchingServiceSubscribeMatches;
  static readonly AddRiderIntent: MatchingServiceAddRiderIntent;
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

export class MatchingServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  evaluateDriver(
    requestMessage: matching_pb.EvaluateDriverRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: matching_pb.MatchResponse|null) => void
  ): UnaryResponse;
  evaluateDriver(
    requestMessage: matching_pb.EvaluateDriverRequest,
    callback: (error: ServiceError|null, responseMessage: matching_pb.MatchResponse|null) => void
  ): UnaryResponse;
  subscribeMatches(requestMessage: matching_pb.SubscribeRequest, metadata?: grpc.Metadata): ResponseStream<matching_pb.MatchEvent>;
  addRiderIntent(
    requestMessage: matching_pb.AddRiderIntentRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: matching_pb.AddRiderIntentResponse|null) => void
  ): UnaryResponse;
  addRiderIntent(
    requestMessage: matching_pb.AddRiderIntentRequest,
    callback: (error: ServiceError|null, responseMessage: matching_pb.AddRiderIntentResponse|null) => void
  ): UnaryResponse;
}

