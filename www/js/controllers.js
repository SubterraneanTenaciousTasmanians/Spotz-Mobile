angular.module('app.controllers', [])

.controller('cameraCtrl', function ($scope, $cordovaCamera) {
  $scope.flag = false;

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

        $scope.flag = 'error';

        // error
      });

  };

})

.controller('mapCtrl', function ($scope) {

})

.controller('cloudTabDefaultPageCtrl', function ($scope) {

})

.controller('loginCtrl', function ($scope) {

})

.controller('signupCtrl', function ($scope) {

});
