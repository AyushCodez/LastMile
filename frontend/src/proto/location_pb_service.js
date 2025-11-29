// package: lastmile.location
// file: location.proto

var location_pb = require("./location_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var LocationService = (function () {
  function LocationService() {}
  LocationService.serviceName = "lastmile.location.LocationService";
  return LocationService;
}());

LocationService.StreamDriverTelemetry = {
  methodName: "StreamDriverTelemetry",
  service: LocationService,
  requestStream: true,
  responseStream: false,
  requestType: location_pb.DriverTelemetry,
  responseType: location_pb.Ack
};

LocationService.GetDriverSnapshot = {
  methodName: "GetDriverSnapshot",
  service: LocationService,
  requestStream: false,
  responseStream: false,
  requestType: location_pb.DriverId,
  responseType: location_pb.DriverSnapshot
};

LocationService.GetDriverEta = {
  methodName: "GetDriverEta",
  service: LocationService,
  requestStream: false,
  responseStream: false,
  requestType: location_pb.DriverEtaRequest,
  responseType: location_pb.DriverEta
};

exports.LocationService = LocationService;

function LocationServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

LocationServiceClient.prototype.streamDriverTelemetry = function streamDriverTelemetry(metadata) {
  var listeners = {
    end: [],
    status: []
  };
  var client = grpc.client(LocationService.StreamDriverTelemetry, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      if (!client.started) {
        client.start(metadata);
      }
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LocationServiceClient.prototype.getDriverSnapshot = function getDriverSnapshot(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(LocationService.GetDriverSnapshot, {
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

LocationServiceClient.prototype.getDriverEta = function getDriverEta(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(LocationService.GetDriverEta, {
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

exports.LocationServiceClient = LocationServiceClient;

