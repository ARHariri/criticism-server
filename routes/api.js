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
router.post('/isLoggedIn', apiResponse('User', 'checkLogin', true, ['user.username', 'user.password']));
router.get('/user/top', apiResponse('User', 'getTopPeople', false));
router.get('/user', apiResponse('User', 'select', true));


//Organ API
router.get('/organ/accessLevel', apiResponse('Organ', 'getAccessLevels', true));
router.get('/organ/part', apiResponse('Organ', 'getParts', true));
router.put('/organ/part', apiResponse('Organ', 'saveOrgan', true, ['body']));


//Criticism API
router.get('/criticism/subject', apiResponse('Criticism', 'getSubjects', true));
router.get('/criticism', apiResponse('Criticism', 'getCriticisms', false));
router.get('/criticism/user', apiResponse('Criticism', 'getMyCriticisms', true, ['user.uid']));
router.get('/criticism/best', apiResponse('Criticism', 'getTheBest', false));
router.put('/criticism', apiResponse('Criticism', 'saveCriticism', true, ['user.uid', 'body']));
router.post('/criticism', apiResponse('Criticism', 'saveCriticism', true, ['user.uid', 'body', 'body.cid']));
router.post('/criticism/vote/:cid', apiResponse('Criticism', 'votingCriticism', true, ['params.cid', 'body.value', 'user.uid']));
router.post('/criticism/backward/:cid', apiResponse('Criticism', 'backwardCriticism', true, ['body', 'params.cid', 'user.uid']));

//Replies API
router.get('/criticism/notreply', apiResponse('User', 'getNotifications', true, ['user.uid']));
router.put('/reply', apiResponse('Criticism', 'saveReply', true, ['body', 'user.uid']));
router.get('/reply/:cid', apiResponse('Criticism', 'getReplies', false, ['params.cid']));
router.post('/reply/vote/:rid', apiResponse('Criticism', 'votingReply', true, ['params.rid', 'body.value', 'user.uid']));
router.post('/reply/thank/:rid', apiResponse('Criticism', 'thankReply', true, ['params.rid', 'body.value', 'user.uid']));

module.exports = router;