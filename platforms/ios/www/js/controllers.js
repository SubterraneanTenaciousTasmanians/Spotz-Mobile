angular.module('app.controllers', [])

.controller('map/NearMeCtrl', function($scope) {

})

.controller('loginCtrl', ['$scope', 'signinFactory', function($scope, signinFactory) {
    $scope.signin = function(userinfo){
      signinFactory.signin(userinfo).then(function(response){
        console.log('HERES THE RESPONSE ', response)
      });
    };
}])

.controller('signupCtrl', ['$scope', 'signupFactory', function($scope, signupFactory) {
  $scope.signup = function(userinfo) {
    signupFactory.signup(userinfo).then(function(response){
      console.log('HERES THE RESPONSE ', response);
    });
  };
}])

.controller('parkingCtrl', function($scope) {

})

.controller('pHOTOUPLOADCtrl', function($http, $scope, $cordovaCamera) {
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
    }
  };
})

.controller('settingCtrl', function($scope) {

})

.controller('socialCtrl', function($scope) {

})
