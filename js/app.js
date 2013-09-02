'use strict';

// Declare app level module which depends on filters, and services
angular.module('RedisViewer', [
  'RedisViewer.filters',
  'RedisViewer.services',
  'RedisViewer.directives',
  'RedisViewer.controllers',
  'ngRoute'
])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.when('/', {
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'
      });
      // $routeProvider.when('/', {templateUrl: 'partials/connect.html', controller: 'ConnectCtrl'});
      // $routeProvider.otherwise({redirectTo: '/'});
    }
  ])
// .run(["$rootScope", "redis", function($rootScope, redis) {
//   $rootScope.Redis = redis.Redis;
//   // redis.connect();
//   // $rootScope.redis = redis.status;
//   // return $rootScope.db = redis.client;
// }]);