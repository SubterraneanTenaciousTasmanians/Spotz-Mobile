'use strict';

angular.module('spotz.map', ['MapServices'])

.controller('mapCtrl', ['$scope', '$rootScope', '$state', 'MapFactory', '$ionicPlatform', '$ionicPopup', function ($scope, $rootScope, $state, MapFactory, $ionicPlatform, $ionicPopup) {

  $ionicPlatform.ready(function () {

    $scope.mapLoading = true;

    $scope.constraints = {
      date: new Date(),
      time: new Date(),//moment().format('H:mm'),
      duration: 1,
      text:'mobile',
    };

    $rootScope.constraints = $scope.constraints;

    $rootScope.$on('googleMapLoaded', function () {
      $scope.mapLoading = false;
    });

    $rootScope.$on('loadMap', function () {

      $scope.mapLoading = true;
    });

    $rootScope.$on('mapLoaded', function () {
      $scope.mapLoading = false;

    });

    $scope.deleteRule = function (zoneId, ruleId) {
      MapFactory.deleteRule(zoneId, ruleId);
    };

    //load the google map, then return map object in callback
    MapFactory.init(function (map) {
      $scope.mapLoading = true;
      var center = map.getCenter();

      //get the parking zones based on the center point
      MapFactory.fetchAndDisplayParkingZonesAt([center.lng(), center.lat()]);

      // map data ready, broadcast to the sibling controller (sideCtrl)
      $rootScope.$broadcast('googleMapLoaded');
    });

    $ionicPlatform.on('resume', function () {
      MapFactory.clearDisplayed();

      //rock on
      MapFactory.init(function (map) {
        $scope.mapLoading = true;
        var center = map.getCenter();

        //get the parking zones based on the center point
        MapFactory.fetchAndDisplayParkingZonesAt([center.lng(), center.lat()]);

        // map data ready, broadcast to the sibling controller (sideCtrl)
        $rootScope.$broadcast('googleMapLoaded');
      });
    });
  });
},
]);
