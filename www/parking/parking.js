'use strict';
angular.module('spotz.parking', ['spotzFilter', 'parkingService', 'timerService'])

.controller('parkingCtrl', function ($scope, $cordovaDeviceMotion, $cordovaGeolocation, $http, $ionicPopup, $timeout, $interval, parkingFactory, timerFactory) {
  $scope.newSpotAvail = '';
  $scope.parked = false;
  $scope.timeLeftOnTimer = 0;
  $scope.timeToPark = 0;


  // takes in a time, sets up options, invokes geoLoc with options.
  $scope.spotAvailableHere = function (timestamp) {
    var positionOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
    };
    $cordovaGeolocation.getCurrentPosition(positionOptions)
        .then (function (position) {
          $scope.newSpotAvail = timerFactory.formatPosition(position, timestamp);

          parkingFactory.postParkingSpot($scope.newSpotAvail)
              .then(function (err, data) {
                $scope.parkingTest = err + ': ' + data;
              });
        });
    $scope.parked = false;
  };

  $scope.updateTimer = function (time) {
    var current = time;
    var x;
    $scope.stopTimer = $interval(function () {
      current -= 1000;
      if (current < 1000) {
        $interval.cancel($scope.stopTimer);
      };

      $scope.timeLeftOnTimer = timerFactory.formatMillisecs(current);
    }, 1000);
  };

  $scope.resetTimer = function () {
    $interval.cancel($scope.stopTimer);
    $scope.timeLeftOnTimer = 0;
    $scope.timeToPark = '';
  };

  $scope.timerCountdown = function (res, time) {
    $scope.updateTimer(time);
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
       $scope.resetTimer();
     });
    }, time);
  };

  $scope.parkNow = function (time) {
    $scope.newSpotAvail = '';
    $scope.parked = true;
    $scope.timerCountdown(null, time);
  };

  // watch Acceleration
  document.addEventListener('deviceready', function () {
    var accelOptions = { frequency: 100 };
    var watch = $cordovaDeviceMotion.watchAcceleration(accelOptions);
    watch.then(null,
      function (error) {
        // An error occurred
        console.log('an error occured')
      },
      function (result) {
        var X = result.x;
        var Y = result.y;
        var Z = result.z;
        var timestamp = result.timestamp;
        // if acceleration exceeds a limit
        if (result.x > 50 || result.y > 50 || result.z > 50) {
          // mark current position as available for parking
          $scope.spotAvailableHere(timestamp);
          $scope.resetTimer();
        }
      });
  }, false);
})