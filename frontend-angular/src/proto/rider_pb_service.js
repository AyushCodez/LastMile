// package: lastmile.rider
// file: rider.proto

import rider_pb from "./rider_pb.js";
import { grpc } from "@improbable-eng/grpc-web";

var RiderService = (function () {
  function RiderService() { }
  RiderService.serviceName = "lastmile.rider.RiderService";
  return RiderService;
}());

RiderService.RegisterRideIntent = {
  methodName: "RegisterRideIntent",
  service: RiderService,
  requestStream: false,
  responseStream: false,
  requestType: rider_pb.RegisterRideIntentRequest,
  responseType: rider_pb.RideIntentResponse
};

RiderService.GetRideStatus = {
  methodName: "GetRideStatus",
  service: RiderService,
  requestStream: false,
  responseStream: false,
  requestType: rider_pb.RideId,
  responseType: rider_pb.RideStatus
};

RiderService.GetRideHistory = {
  methodName: "GetRideHistory",
  service: RiderService,
  requestStream: false,
  responseStream: false,
  requestType: rider_pb.GetRideHistoryRequest,
  responseType: rider_pb.RideHistoryResponse
};

export { RiderService };

function RiderServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

RiderServiceClient.prototype.registerRideIntent = function registerRideIntent(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RiderService.RegisterRideIntent, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RiderServiceClient.prototype.getRideStatus = function getRideStatus(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RiderService.GetRideStatus, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RiderServiceClient.prototype.getRideHistory = function getRideHistory(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RiderService.GetRideHistory, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

export { RiderServiceClient };

