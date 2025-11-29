// package: lastmile
// file: common.proto

import * as jspb from "google-protobuf";

export class AreaEdge extends jspb.Message {
  getToAreaId(): string;
  setToAreaId(value: string): void;

  getTravelMinutes(): number;
  setTravelMinutes(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AreaEdge.AsObject;
  static toObject(includeInstance: boolean, msg: AreaEdge): AreaEdge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AreaEdge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AreaEdge;
  static deserializeBinaryFromReader(message: AreaEdge, reader: jspb.BinaryReader): AreaEdge;
}

export namespace AreaEdge {
  export type AsObject = {
    toAreaId: string,
    travelMinutes: number,
  }
}

export class Area extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getName(): string;
  setName(value: string): void;

  getIsStation(): boolean;
  setIsStation(value: boolean): void;

  clearNeighboursList(): void;
  getNeighboursList(): Array<AreaEdge>;
  setNeighboursList(value: Array<AreaEdge>): void;
  addNeighbours(value?: AreaEdge, index?: number): AreaEdge;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Area.AsObject;
  static toObject(includeInstance: boolean, msg: Area): Area.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Area, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Area;
  static deserializeBinaryFromReader(message: Area, reader: jspb.BinaryReader): Area;
}

export namespace Area {
  export type AsObject = {
    id: string,
    name: string,
    isStation: boolean,
    neighboursList: Array<AreaEdge.AsObject>,
  }
}

export class UserId extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserId.AsObject;
  static toObject(includeInstance: boolean, msg: UserId): UserId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UserId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserId;
  static deserializeBinaryFromReader(message: UserId, reader: jspb.BinaryReader): UserId;
}

export namespace UserId {
  export type AsObject = {
    id: string,
  }
}

