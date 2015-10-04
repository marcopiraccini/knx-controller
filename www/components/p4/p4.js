'use strict';

/**
 * Event Monitor Controller.
 */
 angular.module('knx-console').controller('P4Controller', ['$scope', '$location','knx-service',

  function($scope, $location, knxservice) {
      $scope.updateView();
  }

]);
