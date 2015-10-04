'use strict';

/**
 * Event Monitor Controller.
 */
 angular.module('knx-console').controller('EventCtrl', ['$scope', 'event-service',

  function($scope, eventservice) {

    // EVENT LOGS
    $scope.eventlogs = [];

    eventservice.on('event', function (event) {
        $scope.eventlogs.push(event);
    });

  }

]);
