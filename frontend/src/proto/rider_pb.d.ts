// package: lastmile.rider
// file: rider.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class RegisterRideIntentRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  hasArrivalTime(): boolean;
  clearArrivalTime(): void;
  getArrivalTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setArrivalTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  getDestinationAreaId(): string;
  setDestinationAreaId(value: string): void;

  getPartySize(): number;
  setPartySize(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterRideIntentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterRideIntentRequest): RegisterRideIntentRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RegisterRideIntentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterRideIntentRequest;
  static deserializeBinaryFromReader(message: RegisterRideIntentRequest, reader: jspb.BinaryReader): RegisterRideIntentRequest;
}

export namespace RegisterRideIntentRequest {
  export type AsObject = {
    userId: string,
    stationAreaId: string,
    arrivalTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    destinationAreaId: string,
    partySize: number,
  }
}

export class RideIntentResponse extends jspb.Message {
  getIntentId(): string;
  setIntentId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RideIntentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RideIntentResponse): RideIntentResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RideIntentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RideIntentResponse;
  static deserializeBinaryFromReader(message: RideIntentResponse, reader: jspb.BinaryReader): RideIntentResponse;
}

export namespace RideIntentResponse {
  export type AsObject = {
    intentId: string,
  }
}

export class RideId extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RideId.AsObject;
  static toObject(includeInstance: boolean, msg: RideId): RideId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RideId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RideId;
  static deserializeBinaryFromReader(message: RideId, reader: jspb.BinaryReader): RideId;
}

export namespace RideId {
  export type AsObject = {
    id: string,
  }
}

export class RideStatus extends jspb.Message {
  getIntentId(): string;
  setIntentId(value: string): void;

  getStatus(): RideStatus.StatusMap[keyof RideStatus.StatusMap];
  setStatus(value: RideStatus.StatusMap[keyof RideStatus.StatusMap]): void;

  getTripId(): string;
  setTripId(value: string): void;

  getDestinationAreaId(): string;
  setDestinationAreaId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RideStatus.AsObject;
  static toObject(includeInstance: boolean, msg: RideStatus): RideStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RideStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RideStatus;
  static deserializeBinaryFromReader(message: RideStatus, reader: jspb.BinaryReader): RideStatus;
}

export namespace RideStatus {
  export type AsObject = {
    intentId: string,
    status: RideStatus.StatusMap[keyof RideStatus.StatusMap],
    tripId: string,
    destinationAreaId: string,
    stationAreaId: string,
  }

  export interface StatusMap {
    PENDING: 0;
    SCHEDULED: 1;
    PICKED_UP: 2;
    COMPLETED: 3;
    CANCELLED: 4;
  }

  export const Status: StatusMap;
}

