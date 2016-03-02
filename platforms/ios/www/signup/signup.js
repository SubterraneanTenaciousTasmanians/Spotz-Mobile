'use strict';
angular.module('spotz.signup', ['signupServices'])

.controller('signupCtrl', ['$scope', '$state', '$localStorage', 'signupFactory', function ($scope, $state, $localStorage, signupFactory) {
  $scope.message = '';
  $scope.signup = function (userinfo) {
    signupFactory.signup(userinfo).then(function (response) {
      if (response.status === 201) {
        $localStorage.credentials = response.data.token;
        $state.go('tabsController.map/NearMe');
      } else {
        $scope.message = response.data.message;
      }
    });
  };
},
]);
