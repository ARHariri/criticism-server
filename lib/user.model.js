/**
 * Created by Amin on 01/02/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');

let tableName = 'users';
let idColumn  = 'uid';

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
    this.secret = data.secret;
    this.uid = data.uid;
    this.is_admin = this.username && helpers.adminCheck(this.username);
  }

  exportData(){
    return new Promise((resolve, reject) => {
      let exprt = {};
      if(!this.password){
        if(!this.username)
          reject(error.emptyUsername);
        else
          resolve({name:this.username.toLowerCase()});
      }
      else {
        env.bcrypt.genSalt(101, (err, salt) => {
          if (err)
            reject(err);
          else
            env.bcrypt.hash(this.password, salt, null, (err, hash) => {
              if (err)
                reject(err);
              else
                this.secret = hash;

              if(this.username)
                exprt.name = this.username.toLowerCase();
              exprt.secret = hash;
              resolve(exprt);
            });
        });
      }
    });
  }
  
  insert(data){
    this.username = data.username;
    this.password = data.password;
    return this.save();
  }

  update(uid, data){
    this.uid = uid;
    if(data.username)
      this.username = data.username;
    if(data.password)
      this.password = data.password;
    return this.save();
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