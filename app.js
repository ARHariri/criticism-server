let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');

let index = require('./routes/index');
let api   = require('./routes/api');
let sql   = require('./sql');
let lib      = require('./lib');
let app = express();

app.locals.userMap = new Map();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Authentication handler
app.use(function (req, res, next) {
  let username = req.headers.username;
  let token = req.headers.token;
  
  if((username === undefined || token === undefined) || (username === null || token === null)){
    req.user = null;
    next();
  }
  else{
    let user = lib.helpers.isTestReq(req) ? undefined : app.locals.userMap.get(username);
    
    //Check user from map
    if(user !== undefined){
      //The user is on map
      if(user.token !== token){
        res.status(403)
          .send('The username or token doest not acceptable');
      }
      else{
        user.destroy = setTimeout(function(){
          app.locals.userMap.delete(username);
        }, user.timeOut);
        req.user = user;
        next();
      }
    }
    else{
      //Should load user from database
      let curSql = lib.helpers.isTestReq(req) ? sql.test : sql;
      
      curSql.users.getByUsername({username: username})
        .then((res) => {
          if(res.length === 0)
            req.user = null;
          else{
            //Check JWT
            let password = jwt.verify(token, res[0].pk);
            if(password === token){
              user = {
                uid: res[0].uid,
                name: res[0].name,
                username: res[0].username,
                password: res[0].password,
                email: res[0].email,
                token: res[0].token,
                access_level: res[0].access_level,
                rank: res[0].rank,
                timeOut: 600000
              };
              user.destroy = setTimeout(function(){
                app.locals.userMap.delete(username);
              }, user.timeOut);
  
              app.locals.userMap.set(username, user);
  
              req.user = user;
            }
            else
              req.user = null;
          }
  
          next();
        })
        .catch((err) => {
          res.status(404)
            .send('User not found');
        });
    }
  }
});

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  let jsonError = req.app.get('env') === 'development' ? {
    Message: err.message,
    Stack: err.stack,
  } : {Message: err.message};

  res.status(err.status || 500).json(jsonError);
  console.log(err);
});

module.exports = app;
