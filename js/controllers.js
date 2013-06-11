'use strict';

// Controllers

angular.module('myApp.controllers', [])
  .controller('KeysCtrl', ['$scope', function($scope) {
    
    // $scope.keys = [
    //   {
    // 	hash: 'xxxx',
    // 	type: 'HASH',
    // 	cmd: 'HGETALL xxx'
    //   },
    //   {
    // 	hash: 'xxxx',
    // 	type: 'SET'
    //   }
    // ];
    $scope.redis.keys('*', function(err, reply){
      $scope.keys = reply;
      $scope.$digest();
    });
  }])
  .controller('CmdCtrl', ['$scope', function($scope){
    $scope.send_command = function(cmd_str){
      $scope.redis.send_command(cmd_str, function(err, reply){
	console.log(err, reply);
	$scope.reply = reply;
	$scope.$digest();
      });
    };
  }]);
//   .controller('MyCtrl2', [function() {

//   }]);


// 'use strict';

// /* Controllers */

// function KeysCtrl($scope, socket) {
//   $scope.keys = 'xxx'
// }
