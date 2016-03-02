'use strict';
angular.module('signupServices', [])

.factory('signupFactory', ['$http', function ($http) {
  var authentication = {};
  authentication.signup = function (userinfo) {
    return $http.post('https://spotz.herokuapp.com/auth/signup', userinfo).then(function success(response) {
      return response;
    }, function error(err) {
      return err;
    });
  };

  return authentication;
},
]);