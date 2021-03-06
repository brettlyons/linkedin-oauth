var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
require('dotenv').load();

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  name: "session",
  keys: [process.env.KEY_1, process.env.KEY_2, process.env.KEY_3]
}));
app.use(express.static(path.join(__dirname, 'public')));
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret:  process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/linkedin/callback",
  scope: ['r_emailaddress','r_basicprofile'],
}, function(accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function () {
      // To keep the example simple, the user's LinkedIn profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the LinkedIn account with a user record in your database,
      // and return that user instead.
    done(null, {id: profile.id, displayName: profile.displayName, token: accessToken});
  });
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use('/', routes);
app.use('/users', users);

app.get('/auth/linkedin',
        passport.authenticate('linkedin', { state: 'SOME STATE'  }),
        function(req, res){
          // The request will be redirected to LinkedIn for authentication, so this
          // function will not be called.
});

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/login'
}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
