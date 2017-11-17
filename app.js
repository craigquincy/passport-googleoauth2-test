var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
require('dotenv');

var index = require('./routes/index');
var users = require('./routes/users');

var cookieSession = require('cookie-session')
var express = require('express')

var app = express()

app.use(cookieSession({
  name: 'session',
  keys: ['blahblahblah'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(passport.initialize())
app.use(passport.session())

// take in whatever was passed into `done` inside the GitHubStrategy config
passport.serializeUser((object, done) => {
  console.log("Serialize User", {token: object})

  // when I call `done` _here_, I am passing in the data to be saved to the session
  done(null, {token: object.token})
})

passport.deserializeUser((object, done) => {
  console.log("Deserialize User", object)
  done(null, object)
})

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
  clientID: '893945646364-ti5cfitdk3u8eq3casb74026iokfk2k4.apps.googleusercontent.com',
  clientSecret: '7yqI8C5KHuRYp8_ZMdCbGt1y',
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
}, function(request, accessToken, refreshToken, profile, done) {
  console.log("good things happening passport...", accessToken, refreshToken, profile);

  return done(null, profile);
}))

app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/auth/google/success',
  failureRedirect: '/auth/google/failure'
}));

app.get('/auth/google/success', (req, res) => {
  res.send("successfully logged in")
});

app.get('/auth/google/failure', (req, res) => {
  res.send("zoinks, failure")
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development'
    ? err
    : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
