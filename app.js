var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session =require('express-session')
var passport=require('passport')
//var authenticate=require('./authenticate')
var config=require('./config')
var aboutRouter = require('./routes/aboutRouter')
var portfolioRouter = require('./routes/portfolioRouter')
var profileRouter = require('./routes/profileRouter')
var userRouter = require ('./routes/userRouter')


//var UploadRouter= require('./routes/UploadRouter');
const cors=require('cors')
const mongoose = require('mongoose');
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log("server is connected to the database");
},(err)=>{console.log(err)}
)
var app = express();
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('yohannes-is-the-best'));


app.use(passport.initialize())

app.use(express.static(path.join(__dirname, 'public')));

app.use('/about',aboutRouter)
app.use('/profile',profileRouter)
app.use('/portfolio',portfolioRouter)
app.use('/user', userRouter)

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;