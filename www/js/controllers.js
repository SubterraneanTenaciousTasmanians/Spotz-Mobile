angular.module('app.controllers', [])

.controller('map/NearMeCtrl', ['$scope', '$cordovaKeyboard', '$localStorage', '$cordovaGeolocation', '$ionicLoading', '$ionicPlatform', '$http', 'MapFactory', function ($scope, $cordovaKeyboard, $localStorage, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $http, MapFactory) {
  //Grab token
  var token = $localStorage['credentials'];

  //User street input
  $scope.otherStreet = function () {
    $cordovaKeyboard.hideAccesoryBar(true);

    $cordovaKeyboard.disableScroll(true);
    $cordovaKeyboard.close();

    var isVisible = $cordovaKeyboard.isVisible();
  };

  //Geolocation service
  $ionicPlatform.ready(function () {

    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!',
    });

    var positionOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
    };

    $cordovaGeolocation.getCurrentPosition(positionOptions).then(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      MapFactory.init(function (map) {
        console.log('get current position', token);
        MapFactory.loadColors(function () {
          MapFactory.fetchParkingZones([lng, lat, token]);
        });
      });

      // var myLatLng = new google.maps.LatLng(lat, lng);
      //
      // var mapOptions = {
      //   center: myLatLng,
      //   zoom: 15,
      //   mapTypeId: google.maps.MapTypeId.ROADMAP,
      // };
      //
      // var map = new google.maps.Map(document.getElementById('map'), mapOptions);
      //
      // $scope.map = map;
      $ionicLoading.hide();

      console.log('current position', lat, lng);
      google.maps.event.addListenerOnce($scope.map, 'idle', function () {

        var marker = new google.maps.Marker({
          map: $scope.map,
          enableHighAccuracy: false,
          animation: google.maps.Animation.DROP,
          position: myLatLng,
        });
      });

      console.log('get current position', token);
      $http.get('https://spotz.herokuapp.com/api/zones/' + lat + '/' + lng + '/' + token).then(function (err, data) {
      console.log('POLYGONS BABY', err, data);
    });

    }, function (err) {

      $ionicLoading.hide();
      console.log('error in initializing the map: ', err);
    });
  });

  //Launch Navigation Service
},
])

.controller('loginCtrl', ['$scope', '$localStorage', '$state', 'signinFactory', function ($scope, $localStorage, $state, signinFactory) {
  $scope.signin = function (userinfo) {
    signinFactory.signin(userinfo).then(function (response) {
      if (response.data.success) {
        $localStorage.credentials = response.data.token;
        $state.go('tabsController.map/NearMe');
      }
    });
  };
},
])

.controller('signupCtrl', ['$scope', '$localStorage', 'signupFactory', function ($scope, $localStorage, signupFactory) {
  $scope.signup = function (userinfo) {
    signupFactory.signup(userinfo).then(function (response) {
      if (response.data.success) {
        $localStorage.credentials = response.data.token;
        $state.go('tabsController.map/NearMe');
      }
    });
  };
},
])

.controller('parkingCtrl', function ($scope) {

})

.controller('pHOTOUPLOADCtrl', ['$http', '$scope', '$cordovaCamera', '$ionicPlatform', function ($http, $scope, $cordovaCamera, $ionicPlatform) {
  $scope.takePicture = function () {

    var options = {
    quality: 75,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.CAMERA,
    allowEdit: true,
    encodingType: Camera.EncodingType.PNG,
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
  };

  $scope.sendPhoto = function () {
    // if ($scope.srcImage) {
    $http.post('https://spotz-mobile.herokuapp.com/api/photo', $scope.srcImage).then(function (data) {
      console.log(data);
      $scope.test = data;
    });

    // }
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
