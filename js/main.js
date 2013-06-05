var Redis = require('redis');
var client = Redis.createClient();

client.on('error', alert);

// client.send_command('keys', ['*'], function(err, reply){
//   console.log(err, reply);
// });


$(function(){
  function send_command(){
    var cmd = $('input').val();
    var $pre = $('pre');
    if(cmd !== ''){
      var args = cmd.split(' ');
      console.log(args);
      var command = args[0];
      args.splice(0, 1);
      console.log(command, args);
      client.send_command(command, args, function(err, reply){
	if(err){
	  alert(err);
	}
	$('input').focus().val('');
	console.log(err, reply);
	// $('pre').html(reply);
	$pre.html('Command: ' + cmd + '</br></br>');
	if(typeof(reply) === 'string'){
	  $pre.append(reply + '</br>');
	}
	else{
	  for(var i in reply){
	    $pre.append(i + ':  ' + reply[i] + '</br>');
	  }
	}
      });
    }
  }
  $('button').click(send_command);
  $('input').keydown(function(e){
    if(e.keyCode === 13){
      send_command();
    }
  }).focus();
});
