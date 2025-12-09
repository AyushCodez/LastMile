// package: lastmile.station
// file: station.proto

import * as jspb from "google-protobuf";
import * as common_pb from "./common_pb";

export class AreaId extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AreaId.AsObject;
  static toObject(includeInstance: boolean, msg: AreaId): AreaId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AreaId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AreaId;
  static deserializeBinaryFromReader(message: AreaId, reader: jspb.BinaryReader): AreaId;
}

export namespace AreaId {
  export type AsObject = {
    id: string,
  }
}

export class AreaList extends jspb.Message {
  clearItemsList(): void;
  getItemsList(): Array<common_pb.Area>;
  setItemsList(value: Array<common_pb.Area>): void;
  addItems(value?: common_pb.Area, index?: number): common_pb.Area;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AreaList.AsObject;
  static toObject(includeInstance: boolean, msg: AreaList): AreaList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AreaList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AreaList;
  static deserializeBinaryFromReader(message: AreaList, reader: jspb.BinaryReader): AreaList;
}

export namespace AreaList {
  export type AsObject = {
    itemsList: Array<common_pb.Area.AsObject>,
  }
}

export class ListAreasRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAreasRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAreasRequest): ListAreasRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAreasRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAreasRequest;
  static deserializeBinaryFromReader(message: ListAreasRequest, reader: jspb.BinaryReader): ListAreasRequest;
}

export namespace ListAreasRequest {
  export type AsObject = {
  }
}

export class ListStationsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStationsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListStationsRequest): ListStationsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListStationsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStationsRequest;
  static deserializeBinaryFromReader(message: ListStationsRequest, reader: jspb.BinaryReader): ListStationsRequest;
}

export namespace ListStationsRequest {
  export type AsObject = {
  }
}

