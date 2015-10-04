'use strict';

//Define an angular module for our app
var app = angular.module('knx-console', ['ngAnimate', 'ngRoute']);

//Define Routing for app
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'components/p4/p4.html',
        controller: 'P4Controller'
    }).
      when('/p5', {
        templateUrl: 'components/p5/p5.html',
        controller: 'P5Controller'
      }).
      when('/graph', {
        templateUrl: 'components/graph/graph.html',
        controller: 'GraphController'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);


app.controller('AppController', ['$scope', '$location', '$http','knx-service', 'event-service',

 function($scope, $location, $http, knxservice, eventservice) {
     $scope.next='p5';
     $scope.prev='';
     $scope.updateView = function () {
         if ($location.path() === '/') {
             $scope.next='p5';
             $scope.prev='graph';
         } else if ($location.path() === '/p5') {
             $scope.next='graph';
             $scope.prev='';
         } else if ($location.path() === '/graph') {
             $scope.next='';
             $scope.prev='p5';
         }
     };

     /**
      * Toggle a button (on/off).
      */
     $scope.toggle = function(device) {
         var val;
         if (device.value === 'on') {
             val = 'off';
         } else {
             val = 'on';
         }
         knxservice.post(device, val);
     }

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

     eventservice.on('event', function(event) {
         console.log("EVENT", event);
         if ($scope.devices ) {
             var device = $scope.devices.filter(function(device) {
                 return (event.dest === device.read);
             });
             if ((device) && (device[0])) {
                 device[0].value = event.val;
             }
         }

     });

     $http.get('config/devices.json')
         .then(function(res){
             $scope.devices = res.data;

             // Reset the devices and sends a "read" message to every device
             // to be displayed.
             $scope.devices.forEach(function(device) {
                 if (device.tag === 'light') {
                     device.value = 'off';
                 }
                 knxservice.read(device);
             });
       });
 }

]);
