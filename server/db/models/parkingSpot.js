var db = require('./../db.js');

db.ParkingSpot = db.Model.extend({
  tableName: 'parkingSpot',
});

db.newSpot = function (parkingOptions) {
  return new db.parkingSpot(parkingOptions).save().then(function (model) {
    console.log(model, 'parking spot has been saved');
    return model;
  });
};

module.exports = db;
