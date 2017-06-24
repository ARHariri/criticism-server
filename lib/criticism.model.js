/**
 * Created by Ali on 6/24/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');

let tableName = 'criticisms';
let idColumn  = 'cid';

class Criticism extends SqlTable {
  constructor(test = Criticism.test){
    super(tableName, idColumn, test);
  }
  
  importData(data) {
    this.secret = data.secret;
    this.uid = data.uid;
    this.is_admin = this.username && helpers.adminCheck(this.username);
  }
  
  exportData(){
    
  }
}

Criticism.test = false;
module.exports = Criticism;
