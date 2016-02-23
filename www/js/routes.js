angular.module('app.routes', [])

.config(function ($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('tabsController.map/NearMe', {
      url: '/page2',
      views: {
        tab2: {
          templateUrl: 'templates/map.html',
          controller: 'mapCtrl',
        },
      },
    })
    .state('tabsController', {
      url: '/page1',
      abstract:true,
      templateUrl: 'templates/tabsController.html',
    })
    .state('login', {
      url: '/page5',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl',
    })
    .state('signup', {
      url: '/page6',
      templateUrl: 'templates/signup.html',
      controller: 'signupCtrl',
    })
    .state('tabsController.parking', {
      url: '/page10',
      views: {
        tab1: {
          templateUrl: 'templates/parking.html',
          controller: 'parkingCtrl',
        },
      },
    })
    .state('pHOTOUPLOAD', {
      url: '/page12',
      templateUrl: 'templates/pHOTOUPLOAD.html',
      controller: 'pHOTOUPLOADCtrl',
    })
    .state('tabsController.setting', {
      url: '/page13',
      views: {
        tab10: {
          templateUrl: 'templates/setting.html',
          controller: 'settingCtrl',
        },
      },
    })
    .state('tabsController.social', {
      url: '/page14',
      views: {
        tab3: {
          templateUrl: 'templates/social.html',
          controller: 'socialCtrl',
        },
      },
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/page5');

});
