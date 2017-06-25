/**
 * Created by Ali on 6/24/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');

let criticismTable = 'criticisms';
let criticismIdColumn  = 'cid';
let criticismColumns = ['creator_id', 'subject', 'content', 'creation_date', 'rank', 'parent'];
let tagTable = 'tags';
let tagIdColumn = 'tid';
let tagColumns = ['name'];

class Criticism extends SqlTable {
  constructor(test = Criticism.test){
    super(criticismTable, criticismIdColumn, test);
  }
  
  importData(data) {
    this.secret = data.secret;
    this.uid = data.uid;
    this.is_admin = this.username && helpers.adminCheck(this.username);
  }
  
  exportData(){
    let exprt = {};
    
    criticismColumns.forEach(el => {
      if(this[el] !== undefined)
        exprt[el] = this[el];
    });
    
    return exprt;
  }
  
  saveCriticism(uid, data, cid){
    this[criticismIdColumn] = cid;
    criticismColumns.forEach(el => {
      if(data[el] !== undefined)
        this[el] = data[el];
      else
        this[el] = null;
    });
    
    if(uid)
      this.creator_id = uid;
    
    return this.save();
  }
  
  static getSimilar(words){
    let db = Criticism.test ? env.testDb : env.db;
    
    return new Promise((resolve, reject) => {
      db.query('select criticisms.*' +
        'from criticisms' +
        'join tags_criticisms on criticisms.cid = tags_criticisms.cid' +
        'join tags on tags_criticisms.tid = tags.tid' +
        'where tags.name in (' + words.join(',') + ')')
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        })
    });
  }
}

Criticism.test = false;
module.exports = Criticism;
