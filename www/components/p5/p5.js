'use strict';

/**
 * Event Monitor Controller.
 */
 angular.module('knx-console').controller('P5Controller', ['$scope', '$location','knx-service',

  function($scope, $location, knxservice) {
      $scope.updateView();

      $scope.getLightStyle = function (device) {
          return {
              left: device.pos[0] + 'px',
              top:  device.pos[1] + 'px',
              position: 'absolute',
              width: '32px',
              height: '32px',
              display: 'block',
              'background-image': 'url(img/light_' + device.value +'.png)'
          };
      };

  }

]);
