'use strict';
angular.module('photoUploadService', [])

.factory('photoUploadFactory',['$http', function($http) {
  var factory = {};

  factory.sendData = function(data) {
    return $http.post('https://spotz.herokuapp.com/api/photo', data);
  };

  return factory;
},
]);