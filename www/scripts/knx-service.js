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
    read: function (device, callback) {
        var url = '/knx/' + device.read ;
        $http.get(url).success(function(data) {
            console.log("Read sent", device.read);
        });
    },
    refresh: function (device, callback) {
        var url = '/knx/refresh';
        $http.get(url).success(function(data) {
            console.log("Refresh sent");
        });
    }
  };

});
