// package: lastmile.driver
// file: driver.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as common_pb from "./common_pb";

export class RegisterDriverRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): void;

  getVehicleNo(): string;
  setVehicleNo(value: string): void;

  getCapacity(): number;
  setCapacity(value: number): void;

  getModel(): string;
  setModel(value: string): void;

  getColor(): string;
  setColor(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterDriverRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterDriverRequest): RegisterDriverRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RegisterDriverRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterDriverRequest;
  static deserializeBinaryFromReader(message: RegisterDriverRequest, reader: jspb.BinaryReader): RegisterDriverRequest;
}

export namespace RegisterDriverRequest {
  export type AsObject = {
    userId: string,
    vehicleNo: string,
    capacity: number,
    model: string,
    color: string,
  }
}

export class DriverProfile extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getUserId(): string;
  setUserId(value: string): void;

  getVehicleNo(): string;
  setVehicleNo(value: string): void;

  getCapacity(): number;
  setCapacity(value: number): void;

  clearRoutesList(): void;
  getRoutesList(): Array<RoutePlan>;
  setRoutesList(value: Array<RoutePlan>): void;
  addRoutes(value?: RoutePlan, index?: number): RoutePlan;

  getModel(): string;
  setModel(value: string): void;

  getColor(): string;
  setColor(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DriverProfile.AsObject;
  static toObject(includeInstance: boolean, msg: DriverProfile): DriverProfile.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DriverProfile, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DriverProfile;
  static deserializeBinaryFromReader(message: DriverProfile, reader: jspb.BinaryReader): DriverProfile;
}

export namespace DriverProfile {
  export type AsObject = {
    driverId: string,
    userId: string,
    vehicleNo: string,
    capacity: number,
    routesList: Array<RoutePlan.AsObject>,
    model: string,
    color: string,
  }
}

export class RoutePlan extends jspb.Message {
  getRouteId(): string;
  setRouteId(value: string): void;

  getDriverId(): string;
  setDriverId(value: string): void;

  clearStopsList(): void;
  getStopsList(): Array<RouteStop>;
  setStopsList(value: Array<RouteStop>): void;
  addStops(value?: RouteStop, index?: number): RouteStop;

  getFinalAreaId(): string;
  setFinalAreaId(value: string): void;

  hasCreatedAt(): boolean;
  clearCreatedAt(): void;
  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RoutePlan.AsObject;
  static toObject(includeInstance: boolean, msg: RoutePlan): RoutePlan.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RoutePlan, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RoutePlan;
  static deserializeBinaryFromReader(message: RoutePlan, reader: jspb.BinaryReader): RoutePlan;
}

export namespace RoutePlan {
  export type AsObject = {
    routeId: string,
    driverId: string,
    stopsList: Array<RouteStop.AsObject>,
    finalAreaId: string,
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class RouteStop extends jspb.Message {
  getSequence(): number;
  setSequence(value: number): void;

  getAreaId(): string;
  setAreaId(value: string): void;

  getIsStation(): boolean;
  setIsStation(value: boolean): void;

  getArrivalOffsetMinutes(): number;
  setArrivalOffsetMinutes(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RouteStop.AsObject;
  static toObject(includeInstance: boolean, msg: RouteStop): RouteStop.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RouteStop, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RouteStop;
  static deserializeBinaryFromReader(message: RouteStop, reader: jspb.BinaryReader): RouteStop;
}

export namespace RouteStop {
  export type AsObject = {
    sequence: number,
    areaId: string,
    isStation: boolean,
    arrivalOffsetMinutes: number,
  }
}

export class RegisterRouteRequest extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  clearStopsList(): void;
  getStopsList(): Array<RouteStop>;
  setStopsList(value: Array<RouteStop>): void;
  addStops(value?: RouteStop, index?: number): RouteStop;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterRouteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterRouteRequest): RegisterRouteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RegisterRouteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterRouteRequest;
  static deserializeBinaryFromReader(message: RegisterRouteRequest, reader: jspb.BinaryReader): RegisterRouteRequest;
}

export namespace RegisterRouteRequest {
  export type AsObject = {
    driverId: string,
    stopsList: Array<RouteStop.AsObject>,
  }
}

export class UpdateRouteRequest extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getRouteId(): string;
  setRouteId(value: string): void;

  clearStopsList(): void;
  getStopsList(): Array<RouteStop>;
  setStopsList(value: Array<RouteStop>): void;
  addStops(value?: RouteStop, index?: number): RouteStop;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateRouteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateRouteRequest): UpdateRouteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateRouteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateRouteRequest;
  static deserializeBinaryFromReader(message: UpdateRouteRequest, reader: jspb.BinaryReader): UpdateRouteRequest;
}

export namespace UpdateRouteRequest {
  export type AsObject = {
    driverId: string,
    routeId: string,
    stopsList: Array<RouteStop.AsObject>,
  }
}

export class UpdatePickupRequest extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getRouteId(): string;
  setRouteId(value: string): void;

  getPickingUp(): boolean;
  setPickingUp(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePickupRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePickupRequest): UpdatePickupRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdatePickupRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePickupRequest;
  static deserializeBinaryFromReader(message: UpdatePickupRequest, reader: jspb.BinaryReader): UpdatePickupRequest;
}

export namespace UpdatePickupRequest {
  export type AsObject = {
    driverId: string,
    routeId: string,
    pickingUp: boolean,
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

