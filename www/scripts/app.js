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
         console.log("DEVICES", device);
         var val;
         if (device.value === 'on') {
             val = 'off';
             device.value = 'off';
         } else {
             val = 'on';
             device.value = 'on';
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
             'background-image': 'url(img/light_' + (device.value ? device.value:'off') +'.png)'
         };
     };

     /**
      * Massive read to update all the device status
      */
     $scope.refresh = function() {
         knxservice.refresh(device);
     };

     $http.get('config/devices.json')
         .then(function(res){
             $scope.devices = res.data;
             // Reset the devices and sends a "read" message to every device
             // to be displayed.
             $scope.devices.forEach(function(device) {
                 knxservice.read(device);
             });
       });

     eventservice.on('event', function(event) {
         if ($scope.devices) {
             var device = $scope.devices.filter(function(device) {
                 return (event.dest === device.read);
             });

             if ((device) && (device[0])) {
                 device[0].value = event.val;
             }
             if (event.dest === "consumo.corrente.istantaneo.read") {
                 $scope.consumoCorrente = event.val;
             }
             if (event.dest === "termostato.soggiorno.read") {
                 $scope.termostatoSoggiorno = event.val;
             }
             if (event.dest === "termostato.camera.ma.read") {
                 $scope.termostatoCamera = event.val;
             }
             if (event.dest === "termostato.bimbi.read") {
                 $scope.termostatoBimbi = event.val;
             }
             if (event.dest === "termostato.laboratorio.read") {
                 $scope.termostatoLaboratorio = event.val;
             }
             if (event.dest === "termostato.bagno.read") {
                 $scope.termostatoBagno = event.val;
             }
             if (event.dest === "termostato.casa.albero.read") {
                 $scope.termostatoCasaAlbero = event.val;
             }
         }

     });

 }

]);
