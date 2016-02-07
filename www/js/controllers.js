angular.module('app.controllers', [])

.controller('map/NearMeCtrl', ['$scope', '$cordovaKeyboard', '$cordovaGeolocation', '$ionicLoading', '$ionicPlatform', function ($scope, $cordovaKeyboard, $cordovaGeolocation, $ionicLoading, $ionicPlatform) {
  //User street input
  $scope.otherStreet = function(){

  }
  //Geolocation service
  $ionicPlatform.ready(function () {

    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
    });

    var positionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    $cordovaGeolocation.getCurrentPosition(positionOptions).then(function (position) {
      var lat = position.coords.latitude;
      var long = position.coords.longitude;

      var myLatLng = new google.maps.LatLng(lat, long);

      var mapOptions = {
        center: myLatLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      var map = new google.maps.Map(document.getElementById('map'), mapOptions);

      $scope.map = map;
      $ionicLoading.hide();
    }, function (err) {
      $ionicLoading.hide();
      console.log('error in initializing the map: ', err);
    });
  });

  //Launch Navigation Service
}])

.controller('loginCtrl', ['$scope', 'signinFactory', function ($scope, signinFactory) {
  $scope.signin = function (userinfo) {
    signinFactory.signin(userinfo).then(function (response) {
      console.log('HERES THE RESPONSE ', response);
    });
  };
}])

.controller('signupCtrl', ['$scope', 'signupFactory', function ($scope, signupFactory) {
  $scope.signup = function(userinfo) {
    signupFactory.signup(userinfo).then(function(response){
      console.log('HERES THE RESPONSE ', response);
    });
  };
}])

.controller('parkingCtrl', function($scope) {

})

.controller('pHOTOUPLOADCtrl', function ($http, $scope, $cordovaCamera) {
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
  $scope.sendPhoto = function () {
    // if ($scope.srcImage) {
        $http.post('http://spotz-mobile.herokuapp.com/photo', $scope.srcImage).then( function(data){
          console.log(data)
          $scope.test = data;
      })
    // }
  };
})

.controller('settingCtrl', function($scope) {

})

.controller('socialCtrl', function($scope) {

})
