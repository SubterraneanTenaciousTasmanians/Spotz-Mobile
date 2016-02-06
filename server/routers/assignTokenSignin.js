var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('./../db/controllers/user.js');
var assignToken = express.Router();

assignToken.post('/signin', function (req, res) {
  console.log('-----------*****HELLOOOOOOO*******ANYBODY THERE???----------');
  console.log(req.body);
  User.read({ username: req.body.username }).then(function (model) {
    if (!model) {
      res.json({ success: false, message: 'Authentication failed. User not found' });
    } else if (model) {
      console.log('THIS IS THE MODEL ', model);
      if (model.attributes.password !== req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Invalid Password' });
      } else {
        var token = jwt.sign({ _id: model.attributes.id }, 'SuperSecret', { algorithm: 'HS256', expiresIn: 7200 }, function (token) {
          console.log('Here is the token', token);
          res.json({ success: true, message: 'Here is your token', token: token });
        });
      }
    }
  });
});

module.exports = assignToken;
