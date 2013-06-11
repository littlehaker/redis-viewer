'use strict';

/* Filters */
var moment = require('moment');

angular.module('myApp.filters', [])
  .filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }])
  .filter('ttl', function(){
    return function(ms){
      if(ms>0){
	return moment.duration(ms, "s").humanize(true); 
      }
      else{
	return '';
      }
    };
  });
