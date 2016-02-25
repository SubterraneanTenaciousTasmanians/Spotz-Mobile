// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngStorage', 'ngCordovaOauth', 'angularPayments', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova', 'spotz.map', 'MapHelpers', 'MapServices', 'spotz.donate', 'DonateServices', 'spotz.parking', 'parkingService', 'timerService'])

.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () { 
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});
