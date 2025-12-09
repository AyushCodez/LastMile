// package: lastmile.notification
// file: notification.proto

import * as notification_pb from "./notification_pb";
import {grpc} from "@improbable-eng/grpc-web";

type NotificationServiceNotify = {
  readonly methodName: string;
  readonly service: typeof NotificationService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof notification_pb.Notification;
  readonly responseType: typeof notification_pb.Ack;
};

type NotificationServiceSubscribe = {
  readonly methodName: string;
  readonly service: typeof NotificationService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof notification_pb.SubscribeRequest;
  readonly responseType: typeof notification_pb.Notification;
};

export class NotificationService {
  static readonly serviceName: string;
  static readonly Notify: NotificationServiceNotify;
  static readonly Subscribe: NotificationServiceSubscribe;
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

export class NotificationServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  notify(
    requestMessage: notification_pb.Notification,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: notification_pb.Ack|null) => void
  ): UnaryResponse;
  notify(
    requestMessage: notification_pb.Notification,
    callback: (error: ServiceError|null, responseMessage: notification_pb.Ack|null) => void
  ): UnaryResponse;
  subscribe(requestMessage: notification_pb.SubscribeRequest, metadata?: grpc.Metadata): ResponseStream<notification_pb.Notification>;
}

