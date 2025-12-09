// package: lastmile.trip
// file: trip.proto

import trip_pb from "./trip_pb.js";
import { grpc } from "@improbable-eng/grpc-web";

var TripService = (function () {
  function TripService() { }
  TripService.serviceName = "lastmile.trip.TripService";
  return TripService;
}());

TripService.CreateTrip = {
  methodName: "CreateTrip",
  service: TripService,
  requestStream: false,
  responseStream: false,
  requestType: trip_pb.CreateTripRequest,
  responseType: trip_pb.Trip
};

TripService.UpdateTripStatus = {
  methodName: "UpdateTripStatus",
  service: TripService,
  requestStream: false,
  responseStream: false,
  requestType: trip_pb.UpdateTripRequest,
  responseType: trip_pb.Trip
};

TripService.GetTrip = {
  methodName: "GetTrip",
  service: TripService,
  requestStream: false,
  responseStream: false,
  requestType: trip_pb.TripId,
  responseType: trip_pb.Trip
};

TripService.GetTrips = {
  methodName: "GetTrips",
  service: TripService,
  requestStream: false,
  responseStream: false,
  requestType: trip_pb.GetTripsRequest,
  responseType: trip_pb.GetTripsResponse
};

export { TripService };

function TripServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

TripServiceClient.prototype.createTrip = function createTrip(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(TripService.CreateTrip, {
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

TripServiceClient.prototype.updateTripStatus = function updateTripStatus(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(TripService.UpdateTripStatus, {
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

TripServiceClient.prototype.getTrip = function getTrip(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(TripService.GetTrip, {
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

TripServiceClient.prototype.getTrips = function getTrips(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(TripService.GetTrips, {
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

export { TripServiceClient };

