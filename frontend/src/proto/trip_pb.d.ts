// package: lastmile.trip
// file: trip.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class CreateTripRequest extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getRouteId(): string;
  setRouteId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  clearRiderIdsList(): void;
  getRiderIdsList(): Array<string>;
  setRiderIdsList(value: Array<string>): void;
  addRiderIds(value: string, index?: number): string;

  getDestinationAreaId(): string;
  setDestinationAreaId(value: string): void;

  hasScheduledDeparture(): boolean;
  clearScheduledDeparture(): void;
  getScheduledDeparture(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setScheduledDeparture(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateTripRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateTripRequest): CreateTripRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateTripRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateTripRequest;
  static deserializeBinaryFromReader(message: CreateTripRequest, reader: jspb.BinaryReader): CreateTripRequest;
}

export namespace CreateTripRequest {
  export type AsObject = {
    driverId: string,
    routeId: string,
    stationAreaId: string,
    riderIdsList: Array<string>,
    destinationAreaId: string,
    scheduledDeparture?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class Trip extends jspb.Message {
  getTripId(): string;
  setTripId(value: string): void;

  getDriverId(): string;
  setDriverId(value: string): void;

  getRouteId(): string;
  setRouteId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  getDestinationAreaId(): string;
  setDestinationAreaId(value: string): void;

  clearRiderIdsList(): void;
  getRiderIdsList(): Array<string>;
  setRiderIdsList(value: Array<string>): void;
  addRiderIds(value: string, index?: number): string;

  getStatus(): string;
  setStatus(value: string): void;

  hasScheduledDeparture(): boolean;
  clearScheduledDeparture(): void;
  getScheduledDeparture(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setScheduledDeparture(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Trip.AsObject;
  static toObject(includeInstance: boolean, msg: Trip): Trip.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Trip, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Trip;
  static deserializeBinaryFromReader(message: Trip, reader: jspb.BinaryReader): Trip;
}

export namespace Trip {
  export type AsObject = {
    tripId: string,
    driverId: string,
    routeId: string,
    stationAreaId: string,
    destinationAreaId: string,
    riderIdsList: Array<string>,
    status: string,
    scheduledDeparture?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class UpdateTripRequest extends jspb.Message {
  getTripId(): string;
  setTripId(value: string): void;

  getStatus(): string;
  setStatus(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTripRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTripRequest): UpdateTripRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTripRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTripRequest;
  static deserializeBinaryFromReader(message: UpdateTripRequest, reader: jspb.BinaryReader): UpdateTripRequest;
}

export namespace UpdateTripRequest {
  export type AsObject = {
    tripId: string,
    status: string,
  }
}

export class TripId extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TripId.AsObject;
  static toObject(includeInstance: boolean, msg: TripId): TripId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TripId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TripId;
  static deserializeBinaryFromReader(message: TripId, reader: jspb.BinaryReader): TripId;
}

export namespace TripId {
  export type AsObject = {
    id: string,
  }
}

