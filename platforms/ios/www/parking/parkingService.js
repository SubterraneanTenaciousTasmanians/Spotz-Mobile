'use strict';

angular.module('parkingService', [])

.factory('parkingFactory',[function($http) {
	var factory = {};

	factory.postParkingSpot = function (parkingSpot) {
    return $http.post('https://spotz.herokuapp.com/parkingSpot', parkingSpot);
  };

	return factory;
},
]);