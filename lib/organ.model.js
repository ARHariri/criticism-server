/**
 * Created by Ali on 6/26/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');

let tableName = 'organ_parts';
let idColumn  = 'oid';
let columns = ['name', 'responsible_id', 'parent_organ'];

class Organ extends SqlTable{
  constructor(test=Organ.test){
    super(tableName, idColumn, test);
  }

  static getParts(){
    let curSql = Organ.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql[tableName].getAll()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        })
    })
  }

  static getAccessLevels(){
    let curSql = Organ.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql['access_levels'].getAll()
        .then((res) => {
          resolve(res.map(el => el.name));
        })
        .catch((err) => {
          reject(err);
        })
    })
  }

  static saveOrgan(data){
    let curSql = Organ.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql[tableName].add(data)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }
}

Organ.test = false;
module.exports = Organ;