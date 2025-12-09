// package: lastmile.matching
// file: matching.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class EvaluateDriverRequest extends jspb.Message {
  getDriverId(): string;
  setDriverId(value: string): void;

  getRouteId(): string;
  setRouteId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  getDriverCurrentAreaId(): string;
  setDriverCurrentAreaId(value: string): void;

  getDestinationAreaId(): string;
  setDestinationAreaId(value: string): void;

  getSeatsAvailable(): number;
  setSeatsAvailable(value: number): void;

  getEtaToStationMinutes(): number;
  setEtaToStationMinutes(value: number): void;

  hasDriverLastUpdate(): boolean;
  clearDriverLastUpdate(): void;
  getDriverLastUpdate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setDriverLastUpdate(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EvaluateDriverRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EvaluateDriverRequest): EvaluateDriverRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EvaluateDriverRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EvaluateDriverRequest;
  static deserializeBinaryFromReader(message: EvaluateDriverRequest, reader: jspb.BinaryReader): EvaluateDriverRequest;
}

export namespace EvaluateDriverRequest {
  export type AsObject = {
    driverId: string,
    routeId: string,
    stationAreaId: string,
    driverCurrentAreaId: string,
    destinationAreaId: string,
    seatsAvailable: number,
    etaToStationMinutes: number,
    driverLastUpdate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class MatchResult extends jspb.Message {
  getTripId(): string;
  setTripId(value: string): void;

  getDriverId(): string;
  setDriverId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  getDestinationAreaId(): string;
  setDestinationAreaId(value: string): void;

  clearRiderIdsList(): void;
  getRiderIdsList(): Array<string>;
  setRiderIdsList(value: Array<string>): void;
  addRiderIds(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchResult.AsObject;
  static toObject(includeInstance: boolean, msg: MatchResult): MatchResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchResult;
  static deserializeBinaryFromReader(message: MatchResult, reader: jspb.BinaryReader): MatchResult;
}

export namespace MatchResult {
  export type AsObject = {
    tripId: string,
    driverId: string,
    stationAreaId: string,
    destinationAreaId: string,
    riderIdsList: Array<string>,
  }
}

export class MatchResponse extends jspb.Message {
  getMatched(): boolean;
  setMatched(value: boolean): void;

  clearResultsList(): void;
  getResultsList(): Array<MatchResult>;
  setResultsList(value: Array<MatchResult>): void;
  addResults(value?: MatchResult, index?: number): MatchResult;

  getMsg(): string;
  setMsg(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MatchResponse): MatchResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchResponse;
  static deserializeBinaryFromReader(message: MatchResponse, reader: jspb.BinaryReader): MatchResponse;
}

export namespace MatchResponse {
  export type AsObject = {
    matched: boolean,
    resultsList: Array<MatchResult.AsObject>,
    msg: string,
  }
}

export class MatchEvent extends jspb.Message {
  getEventId(): string;
  setEventId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  hasResult(): boolean;
  clearResult(): void;
  getResult(): MatchResult | undefined;
  setResult(value?: MatchResult): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchEvent.AsObject;
  static toObject(includeInstance: boolean, msg: MatchEvent): MatchEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchEvent;
  static deserializeBinaryFromReader(message: MatchEvent, reader: jspb.BinaryReader): MatchEvent;
}

export namespace MatchEvent {
  export type AsObject = {
    eventId: string,
    stationAreaId: string,
    result?: MatchResult.AsObject,
  }
}

export class SubscribeRequest extends jspb.Message {
  getClientId(): string;
  setClientId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeRequest): SubscribeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeRequest;
  static deserializeBinaryFromReader(message: SubscribeRequest, reader: jspb.BinaryReader): SubscribeRequest;
}

export namespace SubscribeRequest {
  export type AsObject = {
    clientId: string,
  }
}

export class AddRiderIntentRequest extends jspb.Message {
  getRiderId(): string;
  setRiderId(value: string): void;

  getStationAreaId(): string;
  setStationAreaId(value: string): void;

  getDestinationAreaId(): string;
  setDestinationAreaId(value: string): void;

  hasArrivalTime(): boolean;
  clearArrivalTime(): void;
  getArrivalTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setArrivalTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddRiderIntentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddRiderIntentRequest): AddRiderIntentRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddRiderIntentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddRiderIntentRequest;
  static deserializeBinaryFromReader(message: AddRiderIntentRequest, reader: jspb.BinaryReader): AddRiderIntentRequest;
}

export namespace AddRiderIntentRequest {
  export type AsObject = {
    riderId: string,
    stationAreaId: string,
    destinationAreaId: string,
    arrivalTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class AddRiderIntentResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  getMsg(): string;
  setMsg(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddRiderIntentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddRiderIntentResponse): AddRiderIntentResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddRiderIntentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddRiderIntentResponse;
  static deserializeBinaryFromReader(message: AddRiderIntentResponse, reader: jspb.BinaryReader): AddRiderIntentResponse;
}

export namespace AddRiderIntentResponse {
  export type AsObject = {
    success: boolean,
    msg: string,
  }
}

