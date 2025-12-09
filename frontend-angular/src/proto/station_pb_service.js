// package: lastmile.station
// file: station.proto

import station_pb from "./station_pb.js";
import common_pb from "./common_pb.js";
import { grpc } from "@improbable-eng/grpc-web";

var StationService = (function () {
  function StationService() { }
  StationService.serviceName = "lastmile.station.StationService";
  return StationService;
}());

StationService.GetArea = {
  methodName: "GetArea",
  service: StationService,
  requestStream: false,
  responseStream: false,
  requestType: station_pb.AreaId,
  responseType: common_pb.Area
};

StationService.ListAreas = {
  methodName: "ListAreas",
  service: StationService,
  requestStream: false,
  responseStream: false,
  requestType: station_pb.ListAreasRequest,
  responseType: station_pb.AreaList
};

StationService.ListStations = {
  methodName: "ListStations",
  service: StationService,
  requestStream: false,
  responseStream: false,
  requestType: station_pb.ListStationsRequest,
  responseType: station_pb.AreaList
};

export { StationService };

function StationServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

StationServiceClient.prototype.getArea = function getArea(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(StationService.GetArea, {
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

StationServiceClient.prototype.listAreas = function listAreas(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(StationService.ListAreas, {
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

StationServiceClient.prototype.listStations = function listStations(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(StationService.ListStations, {
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

export { StationServiceClient };

