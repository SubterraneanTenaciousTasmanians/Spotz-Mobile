'use strict';
angular.module('signinServices', [])

.factory('signinFactory', ['$http', '$cordovaOauth', function ($http, $cordovaOauth) {
  var authentication = {};
  authentication.signin = function (userinfo) {
    return $http.post('https://spotz.herokuapp.com/auth/signin', userinfo).then(function success(response) {
      return response;
    }, function error(err) {

      return 'Invalid Credentials';
    });
  };

  authentication.googleOauth = function () {
    return $cordovaOauth.google('213370251589-kscceknoocdc5qguj50d5vk9g7im4105.apps.googleusercontent.com',
    ['profile email'], { redirect_uri: 'http://localhost/callback' })
    .then(function success(response) {
      return $http.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + response.access_token)
      .then(function (res) {
        return $http.post('https://spotz.herokuapp.com/auth/googleOauth', { id: res.data.email });
      });
    });
  };

  authentication.facebookOauth = function () {
    return $cordovaOauth.facebook('683872398419305', ['email', 'public_profile'], { redirect_uri: 'http://localhost/callback' })
    .then(function success(response) {
      return $http.get('https://graph.facebook.com/me?access_token=' + response.access_token)
      .then(function (res) {
        return $http.post('https://spotz.herokuapp.com/auth/facebookOauth', { id: res.data.id });
      });
    });
  };

  return authentication;
},
])