angular.module('app.controllers', ['spotzFilter'])

.controller('map/NearMeCtrl', ['$state', '$scope', '$cordovaKeyboard', '$localStorage', '$cordovaGeolocation', '$ionicLoading', '$ionicPlatform', '$http', 'MapFactory', function ($state, $scope, $cordovaKeyboard, $localStorage, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $http, MapFactory) {
  //Grab token
  var token = $localStorage['credentials'];

  //User street input
  $scope.otherStreet = function () {
    if (!token) {
      $state.go('login');
    }

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
        if (!token) {
          $state.go('login');
        }

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

.controller('parkingCtrl', function ($scope, $cordovaDeviceMotion, $cordovaGeolocation, $http, $ionicPopup, $timeout, $interval) {
  $scope.newSpotAvail = '';
  $scope.parked = false;
  $scope.parkingTest = '';
  $scope.timeLeftOnTimer;

  $scope.spotAvailableHere = function (timestamp) {
    var positionOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
    };
    $ionicPopup.confirm({
      title: 'i threw a debugger in it',
    });
    $cordovaGeolocation.getCurrentPosition(positionOptions).then(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      $scope.newSpotAvail = Math.floor(lat) + '/' + Math.floor(lng) + ': ' + timestamp;
      $ionicPopup.alert({ title: $scope.newSpotAvail });

      $http.post('https://spotz.herokuapp.com/parkingSpot', $scope.newSpotAvail).then(function (err, data) {
        $scope.parkingTest = err + ': ' + data;
      });
    });

    $scope.parked = false;
  };

  function formatMillisecs(milliseconds) {

    var result = '';

    x = milliseconds / 1000;
    seconds = Math.floor(x % 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    result = seconds + ' secs' + result;
    x /= 60;
    minutes = Math.floor(x % 60);
    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    result = minutes + ' mins:' + result;
    x /= 60;
    hours = Math.floor(x % 24);
    if (hours < 10  && hours) {
      hours = '0' + hours;
    }

    if (hours) {
      result = hours + ' hours:' + result;
    }

    return result;

  };

  function updateTimer(time) {
    var current = time;
    var x;
    stopTimer = $interval(function () {

      current -= 1000;
      if (current < 1000) {
        $interval.cancel(stopTimer);
      };

      $scope.timeLeftOnTimer = formatMillisecs(current);
    }, 1000);
  };

  $scope.timerCountdown = function (res, time) {
    updateTimer(time);
    $scope.timeLeftOnTimer = time;
    var endtimer = $timeout(
    function () {
      var alertPopup = $ionicPopup.confirm({
       title: 'Parking Timer Expired',
       template: 'Can we mark this spot available?\n Tap cancel to add more time.',
     }).then(function (confirmed) {
       if (confirmed) {
         $scope.spotAvailableHere(Date.now());
       };
     });
    }, time);
  };

  $scope.parkNow = function (time) {
    $scope.parkingTest = time;
    $scope.newSpotAvail = '';
    $scope.parked = true;
    $scope.timerCountdown(null, time);
  };

  // watch Acceleration
  var options = { frequency: 100 };

  document.addEventListener('deviceready', function () {

    var watch = $cordovaDeviceMotion.watchAcceleration(options);
    watch.then(
      null,
      function (error) {
        // An error occurred
      },

      function (result) {
        var X = result.x;
        var Y = result.y;
        var Z = result.z;
        var timestamp = result.timestamp;
        $scope.speed = result;

        // if acceleration exceeds a limit
        if (result.x > 50 || result.y > 50 || result.z > 50) {
          // mark current position as available for parking
          $ionicPopup.confirm({
           title: result.timestamp,
         });
          $scope.spotAvailableHere(timestamp);
        }
      });

    // watch.clearWatch();
    // // OR
    // $cordovaDeviceMotion.clearWatch(watch)
    //   .then(function(result) {
    //     // success
    //     }, function (error) {
    //     // error
    //   });

  }, false);
})

.controller('pHOTOUPLOADCtrl', ['$http', '$timeout', '$scope', '$state', '$cordovaCamera', '$ionicPlatform', '$ionicLoading', '$cordovaGeolocation', function ($http, $timeout, $scope, $state, $cordovaCamera, $ionicPlatform, $ionicLoading, $cordovaGeolocation) {
  $scope.takePhoto = true;
  $scope.srcImage = 'assets/noImage.png';
  $scope.imageSrc = '';
  $scope.analyzed = false;
  $scope.useOcrad = false;
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
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!',
    });
    var positionOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
    };
    $cordovaGeolocation.getCurrentPosition(positionOptions).then(function (position) {
      $ionicLoading.hide();
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var coordinates = JSON.stringify([lat, lng]);

      $http.post('https://spotz.herokuapp.com/api/photo', { post: $scope.imageSrc, coordinates: coordinates }).then(function success(data) {
        $scope.test = data;
        $scope.takePhoto = false;
        $ionicLoading.show({
          template: '<div class="ion-ios-checkmark"></div><br/>Thank you!',
        });
        $timeout(function () {
          $ionicLoading.hide();
          $state.go('tabsController.parking');
        }, 1500);
      }, function error(err) {

        $ionicLoading.hide();
      });
    });
  };

  $scope.ocrad = function () {
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Analyzing!',
    });
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

      $ionicLoading.hide();
    }, function (err) {

      $ionicLoading.hide();
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
