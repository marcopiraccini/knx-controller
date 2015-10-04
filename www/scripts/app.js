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


app.
    controller('AppController', function($scope, $location) {
        $scope.next='p5';
        $scope.prev='';
        $scope.updateNavigation = function () {
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
});
