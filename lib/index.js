/**
 * Created by Amin on 04/02/2017.
 */
const User = require('./user.model');
const Criticism = require('./criticism.model');
const Organ = require('./organ.model');
const helpers = require('./helpers');
let ex = {
  User: User,
  Criticism: Criticism,
  Organ: Organ,
  helpers: helpers,
};

module.exports = ex;
