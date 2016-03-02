
angular.module('MapServices', ['AdminServices', 'MapHelpers'])

.factory('MapFactory', ['$rootScope', '$http', '$window', '$timeout', '$localStorage', '$cordovaGeolocation', 'KeyFactory', 'MapHelperFactory', '$ionicPopup', '$cordovaDevice',  function ($rootScope, $http, $window, $timeout, $localStorage, $cordovaGeolocation, KeyFactory, MapHelperFactory, $ionicPopup, $cordovaDevice) {

  var token = $localStorage['credentials'];

  //google tooltip
  var tooltip = {};
  var searchBox = {};

  //map view boundary
  var topRightX;
  var topRightY;
  var bottomLeftX;
  var bottomLeftY;

  var minZoomLevel = 15;
  var boxSize = 0.006;  //size of box to display features on the map

  //remember what we fetched
  var downloadedGridZones = {};
  var displayedGridZones = {};
  var displayedPolygons = {};

  //what we return
  var factory = {};

  $rootScope.$on('logOut', function () {
    downloadedGridZones = {};
    displayedPolygons = {};
  });

  //===================================================
  //MAP FUNCTIONS

  factory.clearDisplayed = function () {
    displayedGridZones = {};
    displayedPolygons = {};
  };

  factory.filterFeatures = function (constraints) {
    // constraints object can have permitCode text
    // or date, time, duration information for mobile preview

    if (!constraints) {
      return;
    }

    MapHelperFactory.setAllFeatureColors(factory.map, constraints);

  };

  // factory.filterFeaturesByPermitCodeText = function (text) {
  //   MapHelperFactory.setAllFeatureColors(factory.map, MapHelperFactory.getColorOfRule, { text:text });
  // };

  factory.setSelectedFeature = function (feature) {
    //default values
    var id = -1;
    var color = '0,0,0';

    if (feature) {
      id = feature.getProperty('id').toString();
      color = feature.getProperty('color');
    }

    //set the map factory so other UI components know about it
    factory.selectedFeature = {
      feature:feature,
      id:id,
      color:color,
    };
  };

  //===================================================
  //TOOLTIP FUNCTIONS

  factory.refreshTooltipText = function (feature) {

    var rulesToDisplay = MapHelperFactory.createTooltipText(feature);

    //tooltip points to a google map tooltip object
    //append the content and set the location, then display it
    tooltip.setContent('<span class="tooltip-text">' + rulesToDisplay + '</span>', event);
    tooltip.open(factory.map);
    factory.addDeleteButtonClickHandlers();
  };

  factory.addDeleteButtonClickHandlers = function () {

    //add listeners for the remove rule buttons
    var deleteButtons = document.getElementsByClassName('delete-rule');
    for (var i = 0; i < deleteButtons.length; i++) {

      factory.mapEvents.addDomListener(deleteButtons[i], 'click', function () {
        if (confirm('Are you sure you want to delete this rule?')) {
          factory.deleteRule(this.dataset.polyid, this.dataset.ruleid).then(function (rules) {
            factory.selectedFeature.feature.setProperty('rules', rules);
            MapHelperFactory.refreshTooltipText(factory.selectedFeature.feature);
          });
        }
      });

    }

    //add listeners for the remove polygon button
    var deletePolygon = document.getElementsByClassName('delete-polygon');

    factory.mapEvents.addDomListener(deletePolygon[0], 'click', function () {
      if (confirm('Are you sure you want to delete this polygon?')) {
        factory.deleteParkingZone(this.dataset.polyid).then(function (succeeded) {
          if (succeeded) {
            factory.map.data.remove(factory.selectedFeature.feature);
            tooltip.close();
          } else {
            console.log('delete failed');
          }
        });
      }
    });
  };

  //===================================================
  //PARKING ZONE FUNCTIONS

  factory.removeFeaturesNotIn = function (coordinateArray) {

    var displayedZones = {};
    for (var i = 0; i < coordinateArray.length; i++) {
      displayedZones[JSON.stringify(MapHelperFactory.computeGridNumbers(coordinateArray[i]))] = true;
    }

    //search through all download gridzones
    for (var gridZone in downloadedGridZones) {

      //hide any gridZones that are not in the current area
      if (!displayedZones[gridZone]) {

        downloadedGridZones[gridZone].forEach(function (feature) {
          factory.map.data.remove(feature);
        });

        // set the display value to false so that the zones will be
        // displayed next time they are fetched
        displayedGridZones[gridZone] = false;
      }
    }
  };

  factory.fetchAndDisplayParkingZonesAt = function (coordinates) {

    var gridStr = JSON.stringify(MapHelperFactory.computeGridNumbers(coordinates));
    var newColor;

    //check if we already downloaded this gridzone
    if (downloadedGridZones[gridStr]) {

      //check to see if they are displayed, if not, display them
      if (!displayedGridZones[gridStr]) {
        downloadedGridZones[gridStr].forEach(function (feature) {

          factory.map.data.add(feature);

          //color it based on the currently selected constraints ($rootScope.constraints)
          newColor = MapHelperFactory.getColorOfRule(feature, $rootScope.constraints);
          if (newColor) {
            feature.setProperty('color', newColor.color);
            feature.setProperty('show', newColor.show);
          }

        });

        displayedGridZones[gridStr] = true;
      }

      //return a promise, passing array of features
      return new Promise(function (resolve) {
        resolve(downloadedGridZones[gridStr]);
      });

    }

    //if we made it here, we need to fetch the gridzone from the server
    //mark coordinates as downloaded
    downloadedGridZones[gridStr] = [];

    return $http({
      method:'GET',
      url: 'http://spotz.herokuapp.com/api/zones/' + coordinates[0] + '/' + coordinates[1] + '/' + token,
    })
    .success(function (polygonsFromDb) {
      $rootScope.$broadcast('mapLoaded');

      var boundary;
      var p;
      var newFeature;
      var newColor;

      //loop through zone data and put them on the map
      polygonsFromDb.forEach(function (poly, i) {

        //check if we already displayed this polygon
        if (displayedPolygons[poly.id]) {
          return;
        }

        //if we made it here, we need to display this polygon
        //mark polygon as displayed
        displayedPolygons[poly.id] = true;

        //make a geoJSON object to be placed on the map
        //http://geojson.org/geojson-spec.html
        //google maps accepts this type of data

        boundary = JSON.parse(poly.boundary);
        if (poly.rules[0] && poly.rules[0].permitCode.indexOf('sweep') !== -1) {
          //we have a line
          p = {
            type: 'Feature',
            properties:{
              rules: poly.rules,
              index: i,
              color: '0,0,0',
              show: true,
              id: poly.id,
              parkingCode:poly.parkingCode,
            },
            geometry:{
              type: 'LineString',
              coordinates: boundary,
            },
          };
        } else {
          //we have a polygon
          p = {
            type: 'Feature',
            properties:{
              rules: poly.rules,
              index: i,
              color: '0,0,0',
              show: true,
              id: poly.id,
              parkingCode:poly.parkingCode,
            },
            geometry:{
              type: 'MultiPolygon',
              coordinates: [[boundary]],
            },
          };

        }

        //actually put it on the map
        newFeature = factory.map.data.addGeoJson(p)[0];

        //color it based on the currently selected constraints ($rootScope.constraints)
        newColor = MapHelperFactory.getColorOfRule(newFeature, $rootScope.constraints);
        if (newColor) {
          newFeature.setProperty('color', newColor.color);
          newFeature.setProperty('show', newColor.show);
        }

        downloadedGridZones[gridStr].push(newFeature);

      });

      //resolve promise, return array of features
      displayedGridZones[gridStr] = true;
      return downloadedGridZones[gridStr];
    });
  };

  factory.deleteParkingZone = function (polyId) {

    return $http.delete('/api/zones/' + polyId + '/' + token)
    .success(function (data) {
      return true;
    })
    .error(function (err) {
      return false;
    });
  };

  //===================================================
  //RULE FUNCTIONS

  factory.sendRule = function (id, rule) {
    //send off the request to store the data
    var token = $cookies.get('credentials');
    return $http({
      method:'POST',
      url: '/api/rule/' + id,
      data: {
        token: token,
        rule: rule,
      },
    })
    .success(function () {
      //color the space to something
      console.log('rule saved for', id);
    });
  };

  factory.deleteRule = function (polyId, ruleId) {

    var token = $cookies.get('credentials');

    return $http({
      method:'DELETE',
      url:'/api/rule/' + polyId + '/' + ruleId + '/' + token,
    });
  };

  //===================================================
  //INIT
  //loads the google API and sets up map initial event listeners

  factory.init = function (callback) {

    //jsonp
    // added places library to api request.  Required for searchBar option
    $http.jsonp('https://maps.googleapis.com/maps/api/js?key=' + KeyFactory.map + '&libraries=places&callback=JSON_CALLBACK')
    .success(function () {
      var positionOptions = {
        enableHighAccuracy: false,
        timeout: 10000,
      };

      //=====================================================
      //we have a google.maps object here!
      //SET THE MAIN MAP OBJECTS
      //factory.map, factory.mapEvents, tooltip, searchBox
      $cordovaGeolocation.getCurrentPosition(positionOptions).then(function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        //create a new map and center to downtown Berkeley
        factory.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: { lng: lng, lat: lat },
        });

      //create a new map and center to downtown Berkeley
      factory.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: { lng: -122.26156639099121, lat: 37.86434903305901 },
        disableDefaultUI: true,
      });
        //events will allow us to access and remove event listeners
        factory.mapEvents = google.maps.event;


        //save the tooltip (tooltip) in a local variable
        tooltip = new google.maps.InfoWindow();

        // Create the search box and link it to the UI element.
        searchBox = new google.maps.places.SearchBox(document.getElementById('pac-input'));

        //=====================================================
        //enable tooltip display

        factory.map.data.addListener('dblclick', function (event) {
          // event.stopPropagation();
          // console.log(event.feature.getProperty('id'));
          factory.setSelectedFeature(event.feature);
          factory.refreshTooltipText(event.feature);
          tooltip.setPosition(event.latLng);
        });

        //=====================================================
        //tell the map how to set the syle of every feature

        //variables for factory.map.data.setStyle function
        //(so they aren't re-declared each time)
        var weight;
        var color;
        var show;
        var strokeOpacity;
        var fillOpacity;
        var rules;

        //how to set the color based on the rule table
        factory.map.data.setStyle(function (feature) {

          //defaults
          weight = 1;
          color = feature.getProperty('color') || '0,0,0';
          show = feature.getProperty('show') && true;
          strokeOpacity = 1.0;
          fillOpacity = 0.7;
          rules = feature.getProperty('rules') || [];

          //give the street sweeping a thicker line
          if (rules[0] && rules[0].permitCode.indexOf('sweep') !== -1) {
            weight = 3;
          }

          //hide feature
          if (!show) {
            strokeOpacity = 0.3;
            fillOpacity = 0.1;
            weight = 1;
          }

          return ({
             strokeColor: 'rgba(' + color + ', ' + strokeOpacity + ')',
             fillColor:'rgba(' + color  + ', ' + fillOpacity + ')',
             strokeWeight: weight,
           });
        });

        //=====================================================
        // Listener for loading in data as the map scrolls
        function refreshDisplayedFeatures() {

          console.log('refreshing features');
          var coordinates = [factory.map.getCenter().lng(), factory.map.getCenter().lat()];
          var boxBoundaries = [
            [coordinates[0] + boxSize, coordinates[1] + boxSize],
            [coordinates[0] + boxSize, coordinates[1] - boxSize],
            [coordinates[0] - boxSize, coordinates[1] + boxSize],
            [coordinates[0] - boxSize, coordinates[1] - boxSize],
          ];
          boxBoundaries.forEach(function (coordinates) {
            factory.fetchAndDisplayParkingZonesAt(coordinates);
          });

          factory.removeFeaturesNotIn(boxBoundaries);
        }

        //add listenter to debounced version of refreshDisplayedFeatures (front end optimization)
        factory.map.addListener('center_changed', MapHelperFactory.debounce(refreshDisplayedFeatures, 500, true));        //=====================================================

        // Limit the zoom level
        google.maps.event.addListener(factory.map, 'zoom_changed', function () {
          if (factory.map.getZoom() < minZoomLevel) { factory.map.setZoom(minZoomLevel); }
        });

        //=====================================================
        //paint gridlines
        factory.map.addListener('tilesloaded', function () {

          //view display bounds
          topRightY = factory.map.getBounds().getNorthEast().lat();
          topRightX = factory.map.getBounds().getNorthEast().lng();
          bottomLeftY = factory.map.getBounds().getSouthWest().lat();
          bottomLeftX = factory.map.getBounds().getSouthWest().lng();

          MapHelperFactory.paintGridLines(factory.map, bottomLeftX, topRightX, bottomLeftY, topRightY);

        });

        //===================================================
        //finally, we are at the end of init
        //execute the callack passed in, returning the map object
        callback(factory.map);

      }, function err() {

        goToSettings = function () {
          var alertPopup = $ionicPopup.alert({
            title: 'Location service is disabled',
            template: 'Tap OK to go to settings',
          });

          alertPopup.then(function (res) {
            if ($cordovaDevice.getPlatform() === 'Android') {
              cordova.plugins.diagnostic.switchToLocationSettings();
            } else {
              cordova.plugins.diagnostic.switchToSettings();
            }
          });
        };

        goToSettings();
      });

    }).error(function (data) {

      console.log('map load failed', data);
    });
  };

  return factory;
},
]);
