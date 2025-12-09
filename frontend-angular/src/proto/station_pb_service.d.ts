// package: lastmile.station
// file: station.proto

import * as station_pb from "./station_pb";
import * as common_pb from "./common_pb";
import {grpc} from "@improbable-eng/grpc-web";

type StationServiceGetArea = {
  readonly methodName: string;
  readonly service: typeof StationService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof station_pb.AreaId;
  readonly responseType: typeof common_pb.Area;
};

type StationServiceListAreas = {
  readonly methodName: string;
  readonly service: typeof StationService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof station_pb.ListAreasRequest;
  readonly responseType: typeof station_pb.AreaList;
};

type StationServiceListStations = {
  readonly methodName: string;
  readonly service: typeof StationService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof station_pb.ListStationsRequest;
  readonly responseType: typeof station_pb.AreaList;
};

export class StationService {
  static readonly serviceName: string;
  static readonly GetArea: StationServiceGetArea;
  static readonly ListAreas: StationServiceListAreas;
  static readonly ListStations: StationServiceListStations;
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

export class StationServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getArea(
    requestMessage: station_pb.AreaId,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: common_pb.Area|null) => void
  ): UnaryResponse;
  getArea(
    requestMessage: station_pb.AreaId,
    callback: (error: ServiceError|null, responseMessage: common_pb.Area|null) => void
  ): UnaryResponse;
  listAreas(
    requestMessage: station_pb.ListAreasRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: station_pb.AreaList|null) => void
  ): UnaryResponse;
  listAreas(
    requestMessage: station_pb.ListAreasRequest,
    callback: (error: ServiceError|null, responseMessage: station_pb.AreaList|null) => void
  ): UnaryResponse;
  listStations(
    requestMessage: station_pb.ListStationsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: station_pb.AreaList|null) => void
  ): UnaryResponse;
  listStations(
    requestMessage: station_pb.ListStationsRequest,
    callback: (error: ServiceError|null, responseMessage: station_pb.AreaList|null) => void
  ): UnaryResponse;
}

