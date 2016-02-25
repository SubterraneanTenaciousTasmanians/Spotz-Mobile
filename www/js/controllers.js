angular.module('app.controllers', ['spotzFilter'])

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
])

.controller('pHOTOUPLOADCtrl', ['$http', '$timeout', '$scope', '$state', '$cordovaCamera', '$ionicPlatform', '$ionicLoading', '$cordovaGeolocation', function ($http, $timeout, $scope, $state, $cordovaCamera, $ionicPlatform, $ionicLoading, $cordovaGeolocation) {

  $scope.takePhoto = true;
  $scope.srcImage = 'assets/noImage.png';
  $scope.imageSrc = '';
  $scope.analyzed = false;
  $scope.useOcrad = false;
  $scope.keyboardDown = true;

  $scope.buttonToggle = function(){
    console.log("BUTTON TOGGLE FIRED OFF");
    $scope.keyboardDown = !$scope.keyboardDown;
  };
  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
  // window.addEventListener('native.keyboardshow', $scope.buttonToggle);
  // window.addEventListener('native.keyboardhide', $scope.buttonToggle);

  $scope.choosePhoto = function () {
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

    $cordovaCamera.getPicture(options).then(function (data) {
      $scope.takePhoto = false;
      $scope.useOcrad = true;
      $scope.srcImage = 'data:image/png;base64,' + data;
    }, function (err) {

      $scope.srcImage = 'assets/noImage.png';
      console.log(err);

      // error
    });
  };

  $scope.takePicture = function () {
    var options = {
    quality: 100,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.CAMERA,
    allowEdit: true,
    encodingType: Camera.EncodingType.PNG,
    targetWidth: 300,
    targetHeight: 300,
    popoverOptions: CameraPopoverOptions,
    saveToPhotoAlbum: true,
    correctOrientation: true,
  };

    $cordovaCamera.getPicture(options).then(function (data) {
      $scope.takePhoto = false;
      $scope.useOcrad = true;
      $scope.srcImage = 'data:image/png;base64,' + data;
    }, function (err) {

      $scope.srcImage = 'assets/noImage.png';
      console.log(err);

      // error
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

      $http.post('https://spotz.herokuapp.com/api/photo', { post: $scope.imageSrc, coordinates: coordinates }).then(function success(data) {
        $scope.test = data;
        $scope.takePhoto = false;
        $timeout(function () {
          $state.go('tabsController.parking');
        }, 1500);
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

    }, function (err) {

      $scope.imageSrc = 'err' + err;
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

.controller('settingCtrl', ['$state', '$scope', '$localStorage', 'SettingsService', function ($state, $scope, $localStorage, SettingsService) {
  $scope.showForm = false;

  $scope.toggleForm = function () {
    $scope.showForm = !$scope.showForm;
  };

  $scope.logout = function () {
    delete $localStorage.credentials;
    $state.go('login');
  };

  $scope.info = {};
  $scope.transaction = {};
  $scope.amount = 0;
  $scope.message;
  $scope.paid = false;
  $scope.modalShown = false;
  $scope.toggleModal = function () {
  console.log('toggle modal');
  $scope.modalShown = !$scope.modalShown;
};

  $scope.stripeCallback = function (status, response) {
  console.log('2nd STRIPE RESPONSE', response);
  if (response.error) {
    // there was an error. Fix it.
    console.log('ERROR', response.error);
  } else {
    console.log('AMOUNT', $scope.amount);
    $scope.transaction = {
      token: response.id,
      amount: $scope.amount,
    };
    SettingsService.requestToken($scope.transaction).then(function (response) {
      console.log('RESPOSNE FROM FACTORY ', response);
      $scope.paid = response.paid;
      $scope.message = response.message;
    });
  }
};

  // nothing yet
  $scope.handleStripe = function (status, response) {
  console.log('MONEY', $scope.amount);
  console.log('THIS ', $scope.info);
  console.log('STATUSCODE ', status);
  var clientToken = Stripe.card.createToken($scope.info, $scope.stripeCallback);
  console.log('clientToken ', clientToken);
  console.log('1st STRIPE RESPONSE', response);
  console.log('PAID??? ', $scope.paid);
};
},
])

.controller('socialCtrl', ['$scope', function ($scope) {

},
]);
