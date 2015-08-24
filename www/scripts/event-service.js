'use strict';

/**
 * Servce that manages socket.io connections.
 */
 angular.module('event-monitor').factory('event-service', function($rootScope) {

  var socket = io.connect();
  return {
    on: function (eventName, callback) {

      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });

    }
  };

});
