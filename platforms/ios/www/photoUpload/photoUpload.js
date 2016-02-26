'use strict';
angular.module('spotz.photoUpload', ['photoUploadService'])

.controller('pHOTOUPLOADCtrl', ['$timeout', '$scope', '$state', '$cordovaCamera', '$ionicPlatform', 
  '$ionicLoading', '$cordovaGeolocation', 'photoUploadFactory', function ($timeout, $scope, $state, $cordovaCamera, $ionicPlatform, 
    $ionicLoading, $cordovaGeolocation, photoUploadFactory) {

  $scope.takePhoto = true;
  $scope.srcImage = 'assets/noImage.png';
  $scope.imageSrc = '';
  $scope.analyzed = false;
  $scope.useOcrad = false;
  $scope.keyboardDown = true;

  $scope.buttonToggle = function(){
    $scope.keyboardDown = !$scope.keyboardDown;
  };
  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

  var options = {
    quality: 100,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    allowEdit: true,
    encodingType: Camera.EncodingType.PNG,
    targetWidth: 300,
    targetHeight: 300,
    popoverOptions: CameraPopoverOptions,
    saveToPhotoAlbum: true,
    correctOrientation: true,
  };

  $scope.choosePhoto = function () {

    $cordovaCamera.getPicture(options).then(function (data) {
      $scope.takePhoto = false;
      $scope.useOcrad = true;
      $scope.srcImage = 'data:image/png;base64,' + data;
    });
  };

  $scope.takePicture = function () {
    options.sourceType = Camera.PictureSourceType.CAMERA;

    $cordovaCamera.getPicture(options).then(function (data) {
      $scope.takePhoto = false;
      $scope.useOcrad = true;
      $scope.srcImage = 'data:image/png;base64,' + data;
    });
  };

  $scope.sendPhoto = function () {

    var positionOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
    };
    $cordovaGeolocation.getCurrentPosition(positionOptions).then(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var coordinates = JSON.stringify([lat, lng]);

      photoUploadFactory.sendData({ post: $scope.imageSrc, coordinates: coordinates }).then(function success(data) {
        $scope.test = data;
        $scope.takePhoto = false;
        $timeout(function () {
          $state.go('tabsController.parking');
        }, 1100);
      }, function error(err) {

      });
    });
  };

  $scope.ocrad = function () {
    OCRAD(document.getElementById('picture'), function (text) {
      var regexed = text.replace(/[^a-zA-Z0-9:\s]/g, '');
      regexed = regexed.replace(/(\r\n|\n|\r)/g, ' ');
      regexed = regexed.replace(/s:/g, '5:');
      regexed = regexed.replace(/PARKC/g, 'PARKING');
      regexed = regexed.replace(/PARKIN/g, 'PARKING');
      regexed = regexed.replace(/PARING/g, 'PARKING');
      regexed = regexed.replace(/PARKINGC/g, 'PARKING');
      regexed = regexed.replace(/PARKINGG/g, 'PARKING');
      regexed = regexed.replace(/PARWINC/g, 'PARKING');
      regexed = regexed.replace(/PARWING/g, 'PARKING');
      regexed = regexed.replace(/PARXING/g, 'PARKING');
      regexed = regexed.replace(/INC/g, 'ING');
      regexed = regexed.replace(/:3o/g, ':30');
      regexed = regexed.replace(/:0o/g, ':00');
      regexed = regexed.replace(/:oo/g, ':00');
      regexed = regexed.replace(/:o/g, ':00');
      regexed = regexed.replace(/e:/, '5:');
      $scope.$apply(function () {
        $scope.useOcrad = false;
        $scope.analyzed = true;
        $scope.imageSrc = regexed;
      });

    });
  };

  $scope.cancel = function () {
    $scope.srcImage = 'assets/noImage.png';
    $scope.takePhoto = true;
    $scope.analyzed = false;
    $scope.imageSrc = '';
  };
},
])