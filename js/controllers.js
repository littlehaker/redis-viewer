'use strict';

// Controllers

angular.module('myApp.controllers', [])
  .controller('KeysCtrl', ['$scope', function($scope) {
    function keys(){
      $scope.db.keys('*', function(err, reply){
	$scope.keys = reply;
	$scope.$digest();
      });
    }
    $scope.dbs = [0, 1, 2, 3];
    $scope.showdb = function showdb(db){
      $scope.db.select(db, function(err, reply){
	$scope.redis.db = db;
	keys();
      });
    };
    keys();
  }])
  .controller('CmdCtrl', ['$scope', function($scope){
    $scope.send_command = function(cmd_str){
      $scope.db.send_command(cmd_str, function(err, reply){
	console.log(err, reply);
	$scope.reply = reply;
	$scope.$digest();
      });
    };
  }]);
