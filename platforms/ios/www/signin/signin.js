'use strict';
angular.module('spotz.signin', ['signinServices'])

.controller('loginCtrl', ['$scope', '$localStorage', '$state', 'signinFactory', function ($scope, $localStorage, $state, signinFactory) {
  $scope.message = '';
  $scope.checkCredentials = function () {
    if ($localStorage.credentials) {
      $state.go('tabsController.map/NearMe');
    }
  };

  $scope.signin = function (userinfo) {
    signinFactory.signin(userinfo).then(function (response) {
      if (response.status === 200) {
        $localStorage.credentials = response.data.token;
        $state.go('tabsController.map/NearMe');
      } else {
        $scope.message = response;
      }
    });
  };

  $scope.googleSignin = function () {
    signinFactory.googleOauth().then(function (response) {
      $localStorage.credentials = response.data;
      $state.go('tabsController.map/NearMe');
    });
  };

  $scope.facebookSignin = function () {
    signinFactory.facebookOauth().then(function (response) {
      if (response.status === 409) {
        $state.go('login');
      }

      $localStorage.credentials = response.data;
      $state.go('tabsController.map/NearMe');
    });
  };

  $scope.checkCredentials();
},
])