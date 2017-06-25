const lib = require('../lib');
const express = require('express');
const router = express.Router();
const passport = require('passport');

function apiResponse(className, functionName, tokenNeeded=true, reqFuncs=[]){
  let args = Array.prototype.slice.call(arguments, 4);
  let deepFind = function(obj, pathStr){
    let path = pathStr.split('.');
    let len=path.length;
    for (let i=0; i<len; i++){
      if(typeof obj === 'undefined') {
        let err = new Error(`Bad request: request.${pathStr} is not found at '${path[i]}'`);
        err.status = 400;
        throw(err);
      }
      obj = obj[path[i]];
    }
    return obj;
  };
  return(function(req, res) {
    let user = req.user ? req.user.username : req.user;
    req.test = lib.helpers.isTestReq(req);
    if(tokenNeeded && (req.user === null || req.user === undefined)) {
      res.status(403)
        .send('Username or token is incorrect');
    }
    else {
      let dynamicArgs = [];
      for(let i in reqFuncs)
        dynamicArgs.push((typeof reqFuncs[i]==='function') ? reqFuncs[i](req) : deepFind(req,reqFuncs[i]));

      let allArgs = dynamicArgs.concat(args);
      lib[className].test = req.test;
      let isStaticFunction = typeof lib[className][functionName] === 'function';
      let model = isStaticFunction ? lib[className] : new lib[className](req.test);
      model[functionName].apply(isStaticFunction?null:model, allArgs)
        .then(data=> {
          res.status(200)
            .json(data);
        })
        .catch(err=> {
          console.log(`${className}/${functionName}: `, err.message);
          res.status(err.status||500)
            .send(err.message || err);
        });
    }
  });
}

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

//User API
router.post('/login', apiResponse('User', 'login', false, ['body.username', 'body.password']));
router.put('/user', apiResponse('User', 'insert', false, ['body']));
router.delete('/user/:id', apiResponse('User', 'delete', true, ['params.id']));
router.post('/user/:id', apiResponse('User', 'update', true, ['params.id', 'body']));
// router.get('/user', apiResponse('User', 'select', true));


module.exports = router;