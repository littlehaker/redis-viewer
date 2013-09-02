'use strict';

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
      }).when('/about', {
        templateUrl: 'partials/about.html',
      })
      // .when('/', {
      //   templateUrl: 'partials/connect.html',
      //   controller: 'ConnectCtrl'
      // }).otherwise({
      //   redirectTo: '/'
      // });
    }
  ])
// .run(["$rootScope", "redis", function($rootScope, redis) {
//   $rootScope.Redis = redis.Redis;
//   // redis.connect();
//   // $rootScope.redis = redis.status;
//   // return $rootScope.db = redis.client;
// }]);