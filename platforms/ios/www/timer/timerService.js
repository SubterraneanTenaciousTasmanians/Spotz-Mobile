'use strict';

angular.module('timerService', [])

.factory('timerFactory', function(){
	var factory = {}, stopTimer

  factory.formatPosition = function (position, timestamp) {
    return Math.floor(position.coords.latitude)
        + '/' 
        + Math.floor(position.coords.longitude) 
        + ': ' 
        + timestamp;
  };
	factory.formatMillisecs = function (milliseconds) {
		var result = '';
    x = milliseconds / 1000;
    seconds = Math.floor(x % 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    result = seconds + ' secs' + result;
    x /= 60;
    minutes = Math.floor(x % 60);
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    result = minutes + ' mins:' + result;
    x /= 60;
    hours = Math.floor(x % 24);
    if (hours < 10  && hours) {
      hours = '0' + hours;
    }
    if (hours) {
      result = hours + ' hours:' + result;
    }
  return result;
	};
  

  

	return factory;
})