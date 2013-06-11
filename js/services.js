'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  .value('version', '0.1')
  .service('redis', function ($rootScope) {
    var Redis = require('redis');
    function send_command(cmd_str, callback) {
      callback = callback || function(err, reply){};
      var args = cmd_str.split(' ');
      var command = args[0];
      args.splice(0, 1);
      this.client.send_command(command, args, callback);
    }
    this.connect = function (conn_str) {
      this.client = Redis.createClient();
      this.client.on('error', console.log);
    };
    this.status = {
      db: 0,
    };
    // return {
    //   // client: client,
    //   send_command: send_command,
    //   keys: function(wildcard, callback){
    // 	// send_command('keys ' + wildcard, callback);
    // 	client.keys(wildcard, callback);
    // 	// client.keys(wildcard, function(err, reply){
    // 	//   var ret = [];
    // 	//   if(reply){
    // 	//     for(var key in reply){
    
    // 	//     }
    // 	//   }
    // 	// });
    //   }
    // };
  });

