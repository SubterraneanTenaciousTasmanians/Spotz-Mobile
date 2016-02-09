var express = require('express');
var bodyparser = require('body-parser');
var path = require('path');
var morgan = require('morgan');
var env = require('node-env-file');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var passport = require('passport');

var db = require('./db/db.js');
var User = require('./db/controllers/user.js');
var assignTokenSignin = require('./routers/assignTokenSignin.js');
var verifyToken = require('./routers/verifyToken');

var port = process.env.PORT || 3000;

var app = express();
/*
 *Global Middlewares
 */
app.use(morgan('combined'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
/*DESKTOP VERSION
app.use(express.static(__dirname + '/../client/'));
*/
app.use(express.static(__dirname + '/../www/'));
/*
 *Subrouters
 */

//Every request with the beginning endpoint of its assigned URL
//gets ran through the subrouter first
// app.use('/api', verifyToken);
//NOTE: this takes care of passport and our signin/signup
app.use('/auth', assignTokenSignin);

app.post('/photo', function (req, res, next) {
  res.status(200).send(req.body);
})

app.listen(port);
console.log('server listening on port, :', port);
