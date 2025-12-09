// package: lastmile.driver
// file: driver.proto

import driver_pb from "./driver_pb.js";
import common_pb from "./common_pb.js";
import { grpc } from "@improbable-eng/grpc-web";

var DriverService = (function () {
  function DriverService() { }
  DriverService.serviceName = "lastmile.driver.DriverService";
  return DriverService;
}());

DriverService.RegisterDriver = {
  methodName: "RegisterDriver",
  service: DriverService,
  requestStream: false,
  responseStream: false,
  requestType: driver_pb.RegisterDriverRequest,
  responseType: driver_pb.DriverProfile
};

DriverService.RegisterRoute = {
  methodName: "RegisterRoute",
  service: DriverService,
  requestStream: false,
  responseStream: false,
  requestType: driver_pb.RegisterRouteRequest,
  responseType: driver_pb.RoutePlan
};

DriverService.UpdateRoute = {
  methodName: "UpdateRoute",
  service: DriverService,
  requestStream: false,
  responseStream: false,
  requestType: driver_pb.UpdateRouteRequest,
  responseType: driver_pb.RoutePlan
};

DriverService.UpdatePickupStatus = {
  methodName: "UpdatePickupStatus",
  service: DriverService,
  requestStream: false,
  responseStream: false,
  requestType: driver_pb.UpdatePickupRequest,
  responseType: driver_pb.Ack
};

DriverService.GetDriver = {
  methodName: "GetDriver",
  service: DriverService,
  requestStream: false,
  responseStream: false,
  requestType: driver_pb.DriverId,
  responseType: driver_pb.DriverProfile
};

DriverService.GetDriverByUserId = {
  methodName: "GetDriverByUserId",
  service: DriverService,
  requestStream: false,
  responseStream: false,
  requestType: common_pb.UserId,
  responseType: driver_pb.DriverProfile
};

export { DriverService };

function DriverServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

DriverServiceClient.prototype.registerDriver = function registerDriver(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DriverService.RegisterDriver, {
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

DriverServiceClient.prototype.registerRoute = function registerRoute(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DriverService.RegisterRoute, {
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

DriverServiceClient.prototype.updateRoute = function updateRoute(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DriverService.UpdateRoute, {
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

DriverServiceClient.prototype.updatePickupStatus = function updatePickupStatus(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DriverService.UpdatePickupStatus, {
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

DriverServiceClient.prototype.getDriver = function getDriver(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DriverService.GetDriver, {
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

DriverServiceClient.prototype.getDriverByUserId = function getDriverByUserId(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DriverService.GetDriverByUserId, {
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

export { DriverServiceClient };
