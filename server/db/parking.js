'use strict';
var bookShelf = require('./db.js'); //database and schema definitions and configurations
var fs = require('fs');
var helper = require('./dbHelpers.js');  //helper functions

var db = {};
module.exports = db;

//create model from worldGrid table/schema (in db.js)
var WorldGrid = bookShelf.Model.extend({
  tableName: 'worldGrid',
  permitZones: function () {   // creates the association (relationship): worldGrid belongs to many PermitZones
    return this.belongsToMany(PermitZones);
  },
});

//create model from permitZone table/schema (in db.js)
var PermitZones = bookShelf.Model.extend({
  tableName: 'permitZones',
  worldGrid: function () {  // creates the association (relationship): permitZone belongs to many WorldGrid
    return this.belongsToMany(WorldGrid);
  },
});

//create model from permitRules table/schema (in db.js)
var PermitRules = bookShelf.Model.extend({
  tableName: 'permitRules',
});

// Based on the google coordinates, find the corresponding WorldGrid square
// then find the permit zones that are part of that WorldGrid Square
db.findPermitZones = function (coordinates) {

  var worldGridVals = helper.computeGridNumbers(coordinates);  // helper function to compute the world grid square coordinate

  return helper.grabRelatedPolygons({  //helper function to grab the permit zones based on a world grid square
    table: WorldGrid,
    attrs:{
      xIndex: worldGridVals[0],
      yIndex: worldGridVals[1],
    },
  }).then(function (permitZonesData) {
    return permitZonesData;
  });
};

// Save all permit zones into the database
// This should be done on database load only because the zone data should never change
// If new zone data exists, an admin will add it to the permit zone data file
db.savePermitZones = function (zoneArray) {
  /*
  zoneArray = [{
    coordinates:[[x,y],[x,y],[x,y],[x,y],[x,y],[x,y],[x,y],[x,y]],
    permitCode:"R-1H"
  },
  {
    coordinates:[[x,y],[x,y],[x,y],[x,y],[x,y]],
    permitCode:"R-1H"
  }]
  */
  var worldGridVals;
  var tuplesArray = [];
  var singleTuple = {};
  var tupleStoreObj = {};

  //create tuples
  //go through each permit zone object
  zoneArray.forEach(function (zone) {

    //iterate over the shapes (array of the (x,y) coordiantes/points that make up that pologyon/shape)
    zone.coordinates.forEach(function (shapes) {

      //iterate over each set of coordinates/points in the array
      shapes.forEach(function (coordinate) {

        //figure out the world grid corrdinates of each point on the polygon/shape
        worldGridVals = helper.computeGridNumbers(coordinate);

        //create a tuple that links the worldGrid coordinates to the permit zone object
        singleTuple = [
          {
            table: WorldGrid,
            attrs: {
              xIndex:worldGridVals[0],
              yIndex:worldGridVals[1],
            },
          },
          {
            table: PermitZones,
            attrs: {
              boundary:JSON.stringify(shapes),
            },
          },
        ];

        //store as key in object to prevent duplicates
        tupleStoreObj[JSON.stringify(singleTuple)] = singleTuple;

      });
    });
  });

  //store values of tupleStoreObj in an array
  for (var objStr in tupleStoreObj) {
    tuplesArray.push(tupleStoreObj[objStr]);
  }

  //save tuples into database
  //console.log('adding this to db >>>>>', JSON.stringify(tuplesToJoin));
  return helper.saveAndJoinTuples(tuplesArray);
};

// read all of the permitzone data from the file and save the data to the permitzone schema/table
exports.importParkingZone = function (path, callback) {
  console.log('loading data from', path, '...');
  fs.readFile(__dirname + path, 'utf8', function (err, data) {
    if (err) {throw err; }

    var obj = JSON.parse(data);  //put all of the permitzone data into a JSON parsed object
    db.savePermitZones(obj).then(function (promise) {  // savePermitZones function is defined above
      callback(promise);
    });
  });
};
