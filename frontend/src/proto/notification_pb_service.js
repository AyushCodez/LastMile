// package: lastmile.notification
// file: notification.proto

var notification_pb = require("./notification_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var NotificationService = (function () {
  function NotificationService() {}
  NotificationService.serviceName = "lastmile.notification.NotificationService";
  return NotificationService;
}());

NotificationService.Notify = {
  methodName: "Notify",
  service: NotificationService,
  requestStream: false,
  responseStream: false,
  requestType: notification_pb.Notification,
  responseType: notification_pb.Ack
};

NotificationService.Subscribe = {
  methodName: "Subscribe",
  service: NotificationService,
  requestStream: false,
  responseStream: true,
  requestType: notification_pb.SubscribeRequest,
  responseType: notification_pb.Notification
};

exports.NotificationService = NotificationService;

function NotificationServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

NotificationServiceClient.prototype.notify = function notify(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(NotificationService.Notify, {
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

NotificationServiceClient.prototype.subscribe = function subscribe(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(NotificationService.Subscribe, {
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

exports.NotificationServiceClient = NotificationServiceClient;

