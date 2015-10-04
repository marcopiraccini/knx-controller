'use strict';

/**
 * Servce that manages socket.io connections.
 */
 angular.module('knx-console').factory('knx-service', function($rootScope, $http) {

  return {
    post: function (device, value) {
        var req = {
             method: 'POST',
             url: '/knx/' + device.set + '/' + value,
        }
        $http(req).then(function() {
            console.log("Posted", device.set, value);
        });
    },
    read: function (device) {
        var req = {
             method: 'GET',
             url: '/knx/' + device.read
        }
        $http(req).then(function(){
            console.log("Read", device.read);
        });
    }
  };

});
