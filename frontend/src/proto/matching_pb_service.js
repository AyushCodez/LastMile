// package: lastmile.matching
// file: matching.proto

var matching_pb = require("./matching_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var MatchingService = (function () {
  function MatchingService() {}
  MatchingService.serviceName = "lastmile.matching.MatchingService";
  return MatchingService;
}());

MatchingService.EvaluateDriver = {
  methodName: "EvaluateDriver",
  service: MatchingService,
  requestStream: false,
  responseStream: false,
  requestType: matching_pb.EvaluateDriverRequest,
  responseType: matching_pb.MatchResponse
};

MatchingService.SubscribeMatches = {
  methodName: "SubscribeMatches",
  service: MatchingService,
  requestStream: false,
  responseStream: true,
  requestType: matching_pb.SubscribeRequest,
  responseType: matching_pb.MatchEvent
};

MatchingService.AddRiderIntent = {
  methodName: "AddRiderIntent",
  service: MatchingService,
  requestStream: false,
  responseStream: false,
  requestType: matching_pb.AddRiderIntentRequest,
  responseType: matching_pb.AddRiderIntentResponse
};

exports.MatchingService = MatchingService;

function MatchingServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

MatchingServiceClient.prototype.evaluateDriver = function evaluateDriver(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MatchingService.EvaluateDriver, {
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

MatchingServiceClient.prototype.subscribeMatches = function subscribeMatches(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(MatchingService.SubscribeMatches, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

MatchingServiceClient.prototype.addRiderIntent = function addRiderIntent(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MatchingService.AddRiderIntent, {
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

exports.MatchingServiceClient = MatchingServiceClient;

