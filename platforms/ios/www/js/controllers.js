angular.module('app.controllers', ["cameraFactory"])

.controller('map/NearMeCtrl', function($scope) {

})

.controller('mainMenuCtrl', function($scope) {

})

.controller('loginCtrl', function($scope) {

})

.controller('signupCtrl', function($scope) {

})

.controller('parkingCtrl', function($scope) {

})

.controller('pHOTOUPLOADCtrl', function($scope, $cordovaCamera) {
  $scope.takePicture = cameraFactory.cameraMethods.takePhoto;
};

})

.controller('settingCtrl', function($scope) {

})

.controller('socialCtrl', function($scope) {

})
