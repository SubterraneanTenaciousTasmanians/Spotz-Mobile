angular.module('app.services', [])

// .factory('CameraFuncs', [function(){
  // cameraMethods = {};

  // cameraMethods.takePhoto = function () {

  // var options = {
  //   quality: 75,
  //   destinationType: Camera.DestinationType.DATA_URL,
  //   sourceType: Camera.PictureSourceType.CAMERA,
  //   allowEdit: true,
  //   encodingType: Camera.EncodingType.JPEG,
  //   targetWidth: 300,
  //   targetHeight: 300,
  //   popoverOptions: CameraPopoverOptions,
  //   saveToPhotoAlbum: true,
  // };

  // $cordovaCamera.getPicture(options).then(function (imageData) {
  //     $scope.srcImage = 'data:image/jpeg;base64,' + imageData;
  //   }, function (err) {
  //     console.log(err);
  //     // error
  //   });

  //   return cameraMethods;
// }])
.factory('signinFactory', ['$http', function ($http) {
  var authentication = {};
  authentication.signin = function (userinfo) {
    return $http.post('/auth/signin', userinfo);
  };

  return authentication;
}])
.service('BlankService', [function(){

}]);
