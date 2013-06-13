'use strict';

// Controllers

angular.module('myApp.controllers', ['ui.bootstrap']);
var Redis = require('redis');
var Q = require('q');
var _ = require('lodash');

// main controller
function MainCtrl($scope, $dialog){
  $scope.wildcard = '*';
  $scope.logs = [];
  $scope.showCollectDialog = function(){
    var d = $dialog.dialog({
      backdrop: true,
      keyboard: false,
      backdropClick: false,
      templateUrl:  'partials/connect.html', 
      controller: 'ConnectDialogController'
    });
    d.open().then(function(result){
      var db = $scope.db = Redis.createClient(result.port, result.host, result);
      db.on('error', function(err){
	alert(err);
      });
      $scope.keys('*');
    });
  };
  $scope.status = {
    db: 0
  };
  
  var type_cmd_map = {
    string: 'get $key',
    hash: 'hgetall $key',
    set: 'smembers $key',
    zset: 'zrange $key 0 -1 withscores',
    list: 'lrange $key 0 -1'
  };

  $scope.keys = function(wildcard){
    $scope.db.keys(wildcard, function(err, keys){
      var type_promises = [];
      _.forEach(keys, function(key){
	type_promises.push(Q.ninvoke($scope.db, 'type', key));
      });
      var ttl_promises = [];
      _.forEach(keys, function(key){
	ttl_promises.push(Q.ninvoke($scope.db, 'ttl', key));
      });
      Q.all([
	Q.all(type_promises),
	Q.all(ttl_promises)
      ]).done(function(results){
	var types = results[0];
	var ttls = results[1];
	var objs = [];
	for(var i in keys){
	  objs.push({
	    hash: keys[i],
	    type: types[i],
	    ttl: ttls[i],
	    cmd: type_cmd_map[types[i]].replace('$key', keys[i])
	  });
	}
	$scope.status.keys = objs;
	$scope.$digest();
      });
    });
  };
  // TODO: wrap send_command with a log info.
  $scope.send_command = function(cmd_str){
    $scope.logs.push(cmd_str);
    var args = cmd_str.split(' ');
    var command = args[0];
    args.splice(0, 1);
    $scope.db.send_command(command, args, function(err, reply){
      if(typeof reply === 'string'){
	reply = [reply];
      }
      console.log(reply);
      $scope.reply = reply;
      $scope.$digest();
    });
  };
  $scope.showdb = function showdb(db){
    $scope.db.select(db, function(err, reply){
      $scope.status.db = db;
      $scope.wildcard = '*';
      $scope.$digest();
      $scope.keys('*');
    });
  };
  $scope.showCollectDialog();
}

// the dialog is injected in the specified controller
function ConnectDialogController($scope, dialog){
  $scope.conn_opts = {
    host: 'localhost',
    port: 6379
  };
  $scope.close = function(result){
    dialog.close(result);
  };
}

function KeysCtrl($scope){
  $scope.dbs = [0, 1, 2, 3];

}
function CmdCtrl(){}
// .controller('MainCtrl', ['$scope', 'redis', 'ui.bootstrap', function($scope, redis, $location) {
//   // console.log(redis);
//   // $scope.db = redis.client;
//   // console.log(!$scope.client);
//   // if(!$scope.db){
//   //   $location.path('/connect');
//   // }

// }])
// // .controller('ConnectCtrl', ['$rootScope', '$scope', 'redis', '$location', function($rootScope, $scope, redis, $location) {
// //   redis.connect();
// //   console.log(redis);
// //   $rootScope.redis = redis.status;
// //   $rootScope.db = redis.client;
// // }])
// .controller('KeysCtrl', ['$scope', function($scope) {
//   function keys(){
//     $scope.db.keys('*', function(err, reply){
// 	$scope.keys = reply;
// 	$scope.$digest();
//     });
//   }
//   $scope.dbs = [0, 1, 2, 3];
//   $scope.showdb = function showdb(db){
//     $scope.db.select(db, function(err, reply){
// 	$scope.redis.db = db;
// 	keys();
//     });
//   };
//   keys();
// }])
// .controller('CmdCtrl', ['$scope', function($scope){
//   $scope.send_command = function(cmd_str){
//     $scope.db.send_command(cmd_str, function(err, reply){
// 	console.log(err, reply);
// 	$scope.reply = reply;
// 	$scope.$digest();
//     });
//   };
// }]);
