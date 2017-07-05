/**
 * Created by Amin on 01/02/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
const jwt = require('jsonwebtoken');
const moment = require('moment');

let tableName = 'users';
let idColumn  = 'uid';
let columns = ['name', 'username', 'password', 'email', 'pk', 'access_level', 'rank'];

class User extends SqlTable{
  constructor(test=User.test){
    super(tableName, idColumn, test);
  }

  importData(data) {
    columns.forEach(el => {
      if(data[el] !== undefined)
        this[el] = data[el];
    });
  }

  exportData(){
    let exprt = {};
  
    columns.forEach(el => {
      if(this[el] !== undefined)
        exprt[el] = this[el];
    });
    
    return exprt;
  }
  
  generatePrivateKey(username){
    return new Promise((resovle, reject) => {
      env.bcrypt.genSalt(101, (err, salt) => {
        if(err)
          reject(err.message);
        else {
          env.bcrypt.hash(Date.now().toString() + username, salt, null, (err, hash) => {
            if(err)
              reject(err.message);
            else{
              resovle(hash);
            }
          });
        }
      });
    });
  }
  
  insert(data){
    return new Promise((resolve, reject) => {
      this.generatePrivateKey(data.username)
        .then((pk) => {
          data.pk = pk;
          this.importData(data);
          this.password = '123456';
          return this.getHashPassword(this.password);
        })
        .then((res) => {
          this.password = res;
          return this.save();
        })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  update(uid, data){
    this.uid = uid;
    this.importData(data);
    return this.save();
  }
  
  login(username, password){
    return new Promise((resolve, reject) => {
      this.sql[tableName].getByUsername({username: username})
        .then((res) => {
          if(res.length === 0 || res.length > 1)
            reject(error.userNameOrPasswordIncorrect);
          else{
            env.bcrypt.compare(password, res[0].password, (e, r) => {
              if(r){
                let token = jwt.sign(username, res[0].pk);
                resolve(token);
              }
              else{
                reject(error.userNameOrPasswordIncorrect);
              }
            });
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    })
  }

  checkLogin(username){
    return new Promise((resolve, reject) => {
      this.sql[tableName].getByUsername({username: username})
        .then((res) => {
          this.importData(res[0]);
          res[0].token = jwt.sign(username, res[0].pk);
          resolve(res[0]);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        })
    });
  }

  getHashPassword(password){
    return new Promise((resolve, reject) => {
      env.bcrypt.genSalt(101, (err, salt) => {
        if (err)
          reject(err);
        else
          env.bcrypt.hash(password, salt, null, (err, hash) => {
            if (err)
              reject(err);
            else
              resolve(hash)
          });
      });
    })
  }

  static getTopPeople(){
    let curSql = User.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql[tableName].getTopTen()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  static select(){
    let curSql = User.test ? sql.test : sql;
    return curSql.users.select();
  }

  static delete(id){
    let curSql = User.test ? sql.test : sql;
    return curSql.users.delete(id);
  }

  static getNotifications(user_id){
    let curSql = User.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      let notificationPack = {};

      curSql['criticisms'].getNotReply({uid: user_id})
        .then(res => {
          notificationPack['criticisms'] = res;
          return curSql['replies'].getDeadLines({deadline: moment().format('YYYY-MM-DD')});
        })
        .then(res => {
          notificationPack['deadline'] = res;
          resolve(notificationPack);
        })
        .catch(err => {
          reject(err);
        })
    })
  }
}
User.test = false;
module.exports = User;