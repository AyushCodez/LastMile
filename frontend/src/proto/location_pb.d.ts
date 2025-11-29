// package: lastmile.location
// file: location.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class DriverTelemetry extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getRouteId(): string;
  setRouteId(value: string): void;

  getCurrentAreaId(): string;
  setCurrentAreaId(value: string): void;

  getOccupancy(): number;
  setOccupancy(value: number): void;

  hasTs(): boolean;
  clearTs(): void;
  getTs(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTs(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DriverTelemetry.AsObject;
  static toObject(includeInstance: boolean, msg: DriverTelemetry): DriverTelemetry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DriverTelemetry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DriverTelemetry;
  static deserializeBinaryFromReader(message: DriverTelemetry, reader: jspb.BinaryReader): DriverTelemetry;
}

export namespace DriverTelemetry {
  export type AsObject = {
    driverId: string,
    routeId: string,
    currentAreaId: string,
    occupancy: number,
    ts?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class DriverSnapshot extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getRouteId(): string;
  setRouteId(value: string): void;

  getCurrentAreaId(): string;
  setCurrentAreaId(value: string): void;

  getOccupancy(): number;
  setOccupancy(value: number): void;

  hasTs(): boolean;
  clearTs(): void;
  getTs(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTs(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DriverSnapshot.AsObject;
  static toObject(includeInstance: boolean, msg: DriverSnapshot): DriverSnapshot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DriverSnapshot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DriverSnapshot;
  static deserializeBinaryFromReader(message: DriverSnapshot, reader: jspb.BinaryReader): DriverSnapshot;
}

export namespace DriverSnapshot {
  export type AsObject = {
    driverId: string,
    routeId: string,
    currentAreaId: string,
    occupancy: number,
    ts?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class DriverEtaRequest extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DriverEtaRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DriverEtaRequest): DriverEtaRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DriverEtaRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DriverEtaRequest;
  static deserializeBinaryFromReader(message: DriverEtaRequest, reader: jspb.BinaryReader): DriverEtaRequest;
}

export namespace DriverEtaRequest {
  export type AsObject = {
    driverId: string,
    stationAreaId: string,
  }
}

export class DriverEta extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  getReachable(): boolean;
  setReachable(value: boolean): void;

  getEtaMinutes(): number;
  setEtaMinutes(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DriverEta.AsObject;
  static toObject(includeInstance: boolean, msg: DriverEta): DriverEta.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DriverEta, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DriverEta;
  static deserializeBinaryFromReader(message: DriverEta, reader: jspb.BinaryReader): DriverEta;
}

export namespace DriverEta {
  export type AsObject = {
    driverId: string,
    stationAreaId: string,
    reachable: boolean,
    etaMinutes: number,
  }
}

export class DriverId extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DriverId.AsObject;
  static toObject(includeInstance: boolean, msg: DriverId): DriverId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DriverId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DriverId;
  static deserializeBinaryFromReader(message: DriverId, reader: jspb.BinaryReader): DriverId;
}

export namespace DriverId {
  export type AsObject = {
    id: string,
  }
}

export class Ack extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getMsg(): string;
  setMsg(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Ack.AsObject;
  static toObject(includeInstance: boolean, msg: Ack): Ack.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Ack, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Ack;
  static deserializeBinaryFromReader(message: Ack, reader: jspb.BinaryReader): Ack;
}

export namespace Ack {
  export type AsObject = {
    ok: boolean,
    msg: string,
  }
}

