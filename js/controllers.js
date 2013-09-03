'use strict';

var Redis = require('redis');
var Q = require('q');
var _ = require('lodash');

// Controllers
angular.module('RedisViewer.controllers', [
  'ui.bootstrap',
  'ngProgress'
]).controller('MenuCtrl', ['$scope', '$location',
  function($scope, $location) {
    $scope.inPath = function(path) {
      var cur_path = $location.path().substr(0, path.length);
      if (cur_path == path) {
        if ($location.path().substr(0).length > 1 && path.length == 1)
          return false;
        else
          return true;
      } else {
        return false;
      }
    }
  }
]).controller('NavCtrl', ['$scope',
  function($scope) {

  }
])


// main controller

function MainCtrl($scope, $dialog, progressbar) {
  progressbar.color('#29d');
  $scope.wildcard = '*';
  $scope.logs = [];
  $scope.showConnectDialog = function() {
    var d = $dialog.dialog({
      backdrop: true,
      keyboard: false,
      backdropClick: false,
      templateUrl: 'partials/connect.html',
      controller: 'ConnectDialogController'
    });
    d.open().then(function(result) {
      var db = $scope.db = Redis.createClient(result.port, result.host, result);
      db.on('error', function(err) {
        alert(err);
      });
      if (result.password) {
        console.log('auth')
        db.auth(result.password, function(err) {
          $scope.keys('*');
        });
      } else {
        console.log('no auth')
        $scope.keys('*');
      }
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
  $scope.keys_tree = [];

  $scope.keys = function(wildcard) {
    progressbar.start();
    $scope.db.keys(wildcard, function(err, keys) {
      keys_to_tree(keys, function(err, keys_tree){
        $scope.$apply(function(){
          progressbar.complete();
          $scope.keys_tree = keys_tree;
        });
      });


      // var type_promises = [];
      // _.forEach(keys, function(key) {
      //   type_promises.push(Q.ninvoke($scope.db, 'type', key));
      // });
      // var ttl_promises = [];
      // _.forEach(keys, function(key) {
      //   ttl_promises.push(Q.ninvoke($scope.db, 'ttl', key));
      // });
      // Q.all([
      //   Q.all(type_promises),
      //   Q.all(ttl_promises)
      // ]).done(function(results) {
      //   var types = results[0];
      //   var ttls = results[1];
      //   var objs = [];
      //   for (var i in keys) {
      //     objs.push({
      //       hash: keys[i],
      //       type: types[i],
      //       ttl: ttls[i],
      //       cmd: type_cmd_map[types[i]].replace('$key', keys[i])
      //     });
      //   }
      //   $scope.status.keys = objs;
      //   $scope.$digest();
      //   progressbar.complete();
      // });
    });
  };

  // $scope.tree_click = function(branch){
  //   if(branch.data.key){
  //     $scope.showKey(branch.data.key);
  //   }
  // }

  function send_command(cmd_str, callback){
    var args = cmd_str.split(' ');
    var command = args[0];
    args.splice(0, 1);
    $scope.db.send_command(command, args, function(err, reply) {
      callback(err, reply);
    });
  }

  $scope.showKey = function(key){
    if (key) {
      // $scope.send_command('type ' + key);
      $scope.db.type(key, function(err, type) {
        var command = type_cmd_map[type].replace('$key', key);
        send_command(command, function(err, reply){
          $scope.$apply(function(){
            $scope.logs.push(command);
            $scope.reply = reply;
            $scope.type = type;
            $scope.key = key;
          });
        });
      });
    }
  };

  function keys_to_tree(keys, callback) {
    var splitter = ':';
    var hash = {};
    // use a hash to generate the tree
    for(var i = 0; i < keys.length; i++){
      var key = keys[i];
      var key_levels = key.split(':');
      var levels = key_levels.length;
      var node = hash;
      for(var level = 0; level < key_levels.length; level++){
        var key_level = key_levels[level];
        var tmp = node[key_level];
        if (tmp) {

        } else {
          tmp = {
            label: key_level,
            data: {},
            children: {}
          };
          if(level + 1 == levels){
            tmp.data.key = key;
          }
          node[key_level] = tmp;
        }
        node = tmp.children;
      }
    }
    // convert hash to array
    function hash2array(node){
      var children = [];
      for(var key in node.children){
        children.push(hash2array(node.children[key]));
      }
      node.children = children;
      return node;
    }
    var ret = hash2array({
      children: hash
    });

    var keys_tree = ret.children;
    callback(null, keys_tree);
  }

  // TODO: wrap send_command with a log info.
  $scope.send_command = function(cmd_str) {
    // progressbar.start();
    $scope.logs.push(cmd_str);
    send_command(cmd_str, function(err, reply){

      if (typeof reply === 'string') {
        reply = [reply];
      }
      // console.log(reply);
      $scope.reply = reply;
      $scope.$digest();
      // progressbar.complete();
    });
  };
  $scope.showdb = function showdb(db) {
    $scope.db.select(db, function(err, reply) {
      $scope.status.db = db;
      $scope.wildcard = '*';
      $scope.$digest();
      $scope.keys('*');
    });
  };
  $scope.showConnectDialog();
}

// the dialog is injected in the specified controller
function ConnectDialogController($scope, dialog) {
  $scope.conn_opts = {
    host: 'localhost',
    port: 6379
  };
  $scope.close = function(result) {
    dialog.close(result);
  };
}

function KeysCtrl($scope) {
  $scope.dbs = [0, 1, 2, 3];
  // $scope.select = function(branch) {
  //   console.log(branch);
  // }
}

function CmdCtrl() {}
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