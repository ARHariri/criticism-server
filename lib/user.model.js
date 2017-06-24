/**
 * Created by Amin on 01/02/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
const jwt = require('jsonwebtoken');

let tableName = 'users';
let idColumn  = 'uid';
let columns = ['name', 'username', 'password', 'email', 'pk', 'access_level', 'rank'];

class User extends SqlTable{
  constructor(test=User.test){
    super(tableName, idColumn, test);
  }

  load(username,password){
    this.password = password;
    this.username = username.toLowerCase();
    return super.load({name:this.username});
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
          if(res.length === 0 || res[0].password !== password)
            reject(error.userNameOrPasswordIncorrect);
          else{
            if(res[0].password === password){
              let token = jwt.sign(password, res[0].pk);
              resolve(token);
            }
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    })
  }
  
  static select(){
    let curSql = User.test ? sql.test : sql;
    return curSql.users.select();
  }

  static delete(id){
    let curSql = User.test ? sql.test : sql;
    return curSql.users.delete(id);
  }
}
User.test = false;
module.exports = User;