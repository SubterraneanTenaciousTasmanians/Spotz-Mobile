angular.module('app.controllers', [])

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
  $scope.takePicture = function () {

  var options = {
    quality: 75,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.CAMERA,
    allowEdit: true,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 300,
    targetHeight: 300,
    popoverOptions: CameraPopoverOptions,
    saveToPhotoAlbum: true,
  };

  $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.srcImage = 'data:image/jpeg;base64,' + imageData;
    }, function (err) {
      console.log(err);
      // error
    });
}
})

.controller('settingCtrl', function($scope) {

})

.controller('socialCtrl', function($scope) {

})
