angular.module('app.routes', [])

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.transition('ios');
  $ionicConfigProvider.tabs.style('standard').position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center').positionPrimaryButtons('left');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('tabsController.map/NearMe', {
      url: '/page2',
      views: {
        tab2: {
          templateUrl: 'map/map.html',
          controller: 'mapCtrl',
        },
      },
    })
    .state('tabsController', {
      url: '/page1',
      abstract:true,
      templateUrl: 'tabs/tabsController.html',
    })
    .state('login', {
      url: '/page5',
      templateUrl: 'signin/login.html',
      controller: 'loginCtrl',
    })
    .state('signup', {
      url: '/page6',
      templateUrl: 'signup/signup.html',
      controller: 'signupCtrl',
    })
    .state('tabsController.parking', {
      url: '/page10',
      views: {
        tab1: {
          templateUrl: 'parking/parking.html',
          controller: 'parkingCtrl',
        },
      },
    })
    .state('pHOTOUPLOAD', {
      url: '/page12',
      templateUrl: 'photoUpload/pHOTOUPLOAD.html',
      controller: 'pHOTOUPLOADCtrl',
    })
    .state('tabsController.setting', {
      url: '/page13',
      views: {
        tab10: {
          templateUrl: 'settingAndDonation/setting.html',
          controller: 'settingCtrl',
        },
      },
    })
    .state('donate', {
      url: '/page14',
      templateUrl: 'donate/donate.html',
      controller: 'donateCtrl',
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/page5');

});
