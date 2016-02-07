var express = require('express');
var bodyparser = require('body-parser');
var path = require('path');
var morgan = require('morgan');
var env = require('node-env-file');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var cookieParser = require('cookie-parser');

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
app.use(express.static(__dirname+ '/../www/'))
/*
 *Subrouters
 */

//Every request with the beginning endpoint of its assigned URL
//gets ran through the subrouter first
// app.use('/api', verifyToken);
app.use('/auth', assignTokenSignin);

/**
 * environment file for developing under a local server
 * comment out before deployment
 */
env(__dirname + '/.env');

var GOOGLE_CLIENT_ID = process.env.GOOGLECLIENTID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLECLIENTSECRET;
var FACEBOOK_CLIENT_ID = process.env.FACEBOOKCLIENTID;
var FACEBOOK_CLIENT_SECRET = process.env.FACEBOOKCLIENTSECRET;
/**
 * Serializing user id to save the user's session
 */
passport.serializeUser(function (user, done) {
  if (!user.id) {
    done(null, user);
  } else {
    done(null, user.id);
  }
});

passport.deserializeUser(function (id, done) {
  /*MySQL query for User.findById(id, function(err, user) {
    done(err, user);
  });*/
  User.read({ id: id }, function (err, user) {
    console.log('err in deserializing', err);
    done(err, user);
  });
});
/**
 * Sign in with facebook
 */
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_CLIENT_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['email'],
  passReqToCallback: true,
}, function (req, accessToken, refreshToken, profile, done) {
  console.log('profile', profile);
  User.read({ facebookId: profile.id }).then(function (user) {
    if (user) {
      console.log('there is a user', user);
      return done(null, user);
    } else {
      console.log('it doesnt exist', user);
      User.create({ facebookId: profile.id }).then(function (model) {
        return done(null, user);
      });
    }
  });
}));
/**
 * Sign in with Google
 */
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true,
}, function (req, accessToken, refreshToken, profile, done) {
  console.log('profile', profile.emails[0].value);
  return User.read({ googleId: profile.emails[0].value }).then(function (user) {
    console.log('Here is the user', user);
    if (user) {
      return done(null, user);
    } else {
      User.create({ googleId: profile.emails[0].value }).then(function (user) {
        return done(null, user);
      });
    }
  });
}));
/**
 * Redirect to Google Signin and grab user info
 */
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));

app.post('/photo', function(req, res, next){
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  res.status(200).send(req.body);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { scope: 'profile email', failureRedirect: '/' }),
  function (req, res) {
    console.log('REQUEST DOT USER ', req.user);
    User.read({ googleId: req.user.attributes.googleId }).then(function (model) {
      console.log('MR MEESEEKS ', model);
      if (!model) {
        res.json({ success: false, message: 'Authentication failed. User not found' });
      } else if (model) {
        var token = jwt.sign({ _id: model.attributes.id }, 'SuperSecret', { algorithm: 'HS256', expiresInMinutes: 240 }, function (token) {
          console.log('Here is the token', token);
          res.json({ success: true, message: 'Here is your token', token: token });
        });
      }
    });
  }
);

/**
 * Redirect to Facebook Signin
 *
 * NOTE:It redirects to homepage when user authenticates for the first time
 */
app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),

  function (req, res) {
    console.log('REQUEST DOT USER ', req.user);
    User.read({ facebookId: req.user.attributes.facebookId }).then(function (model) {
      if (!model) {
        res.json({ success: false, message: 'Authentication failed. User not found' });
      } else if (model) {
        var token = jwt.sign({ _id: model.attributes.id }, 'SuperSecret', { algorithm: 'HS256', expiresInMinutes: 240 }, function (token) {
          console.log('Here is the token', token);
          res.json({ success: true, message: 'Here is your token', token: token });
        });
      }
    });
  }
);

app.post('/auth/signup', function(req, res) {
  console.log('SEND FROM BACKEND ', req.body);
  User.create(req.body).then(function(model){
    User.read({ username: req.body.username }).then(function (model) {
      var token = jwt.sign({ _id: model.attributes.id }, 'SuperSecret', { algorithm: 'HS256', expiresIn: 7200 }, function (token) {
        console.log('Here is the token', token);
        res.json({ success: true, message: 'Here is your token', token: token });
      });
    });
  })
});


console.log('fu pay me');

app.listen(port);
