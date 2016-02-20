angular.module('app.controllers', ['spotzFilter'])

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

.controller('parkingCtrl', function ($scope, $cordovaDeviceMotion, $cordovaGeolocation, $http, $ionicPopup, $timeout, $interval) {
  $scope.newSpotAvail = '';
  $scope.parked = false;
  $scope.parkingTest = '';
  $scope.timeLeftOnTimer;

  function spotAvailableHere(timestamp) {
    var positionOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
    };
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
         spotAvailableHere(Date.now());
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
        var timeStamp = result.timestamp;
        $scope.speed = result;

        // if acceleration exceeds a limit
        if (result.x > 50 || result.y > 50 || result.z > 50) {

          // mark current position as available for parking
          spotAvailableHere(timestamp);
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

.controller('settingCtrl', ['$scope', function ($scope) {

},
])

.controller('socialCtrl', ['$scope', function ($scope) {

},
]);
