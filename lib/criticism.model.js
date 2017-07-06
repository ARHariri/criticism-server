/**
 * Created by Ali on 6/24/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
const jalali = require('jalaali-js');
const moment = require('moment');

let criticismTable = 'criticisms';
let criticismIdColumn  = 'cid';
let criticismColumns = ['creator_id', 'subject', 'c_content', 'part', 'creation_date', 'rank', 'parent'];
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
    });
    
    if(uid)
      this.creator_id = uid;

    return new Promise((resolve, reject) => {
      let criticism_id;
      if(data.subject_id === null || data.subject_id === undefined){     //Add subject to database
        this.sql['subjects'].add({name: data.subject})
          .then((res) => {
            return this.save();
          })
          .then(res => {
            criticism_id = res;
            return Criticism.saveTags(data.tags, criticism_id);
          })
          .then(res => {
            resolve(criticism_id);
          })
          .catch(err => {
            reject(err);
          });
      }
      else{                             //Subject is exist
        this.save()
          .then(res => {
            criticism_id = res;
            return Criticism.saveTags(data.tags, criticism_id);
          })
          .then(res => {
            resolve(criticism_id);
          })
          .catch(err => {
            reject(err);
          })
      }
    })
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

  static getSubjects(){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql['subjects'].select()
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    })
  }

  static getCriticisms(){
    let curSql = Criticism.test ? sql.test : sql;
    let db = Criticism.test ? env.testDb : env.db;

    return new Promise((resolve, reject) => {
      curSql[criticismTable].getAll()
        .then(res => resolve(res))
        .catch(err => reject(err));
    })
  }

  static getTheBest(){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql[criticismTable].getTheBest()
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        })
    });
  }

  static getMyCriticisms(user_id){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql[criticismTable].getByCreatorId({uid: user_id})
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        })
    });
  }

  static saveTags(tags, criticism_id){
    let db = Criticism.test ? env.testDb : env.db;

    return new Promise((resolve, reject) => {
      if(tags === null || tags.length === 0)
        resolve(null);
      else{
        db.query('select tid from tags where name in (' + tags.map(el => '\'' + el + '\'').join(',') + ')')
          .then(res => {
            return db.tx(t => {
              let addQueries = [];
              tags.forEach(el => {
                addQueries.push(db.query('insert into tags(name) select ' + '\'' + el + '\'' + ' where not exists (select name from tags where name = ' + '\'' + el + '\'' + ')'));
              });

              return t.batch(addQueries);
            })
          })
          .then(res => {
            return db.query('select tid from tags where name in (' + tags.map(el => '\'' + el + '\'').join(',') + ')');
          })
          .then(res => {
            let valueList = res.map(el => '(' + criticism_id + ',' + el.tid + ')').join(',');

            console.log(valueList);

            return db.query('insert into tags_criticisms(cid, tid) values ' + valueList);
          })
          .then(res => resolve(res))
          .catch(err => {
            console.log(err);
            reject(err);
          })
      }
    });
  }

  static votingCriticism(criticism_id, value, user_id){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql['rank_criticisms'].get({cid: criticism_id, uid: user_id})
        .then(res => {
          if(res.length === 0)
            return curSql['rank_criticisms'].add({cid: criticism_id, uid: user_id, vote: value});
          else {
            if(res[0].vote !== value)
              return curSql['rank_criticisms'].voting({vote: value, cid: criticism_id, uid: user_id});
            else
              return Promise.reject(error.votingNotAllowed);
          }
        })
        .then(res => {
          return curSql[criticismTable].ranking({cid: criticism_id, value: value});
        })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static votingReply(reply_id, value, user_id){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql['rank_replies'].get({rid: reply_id, uid: user_id})
        .then(res => {
          if(res.length === 0)
            return curSql['rank_replies'].add({rid: reply_id, uid: user_id, vote: value});
          else {
            if(res[0].vote !== value)
              return curSql['rank_replies'].voting({vote: value, rid: reply_id, uid: user_id});
            else
              return Promise.reject(error.votingNotAllowed);
          }
        })
        .then(res => {
          return curSql['replies'].ranking({rid: reply_id, value: value});
        })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static thankReply(reply_id, value, user_id){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql['thank_replies'].get({rid: reply_id, uid: user_id})
        .then(res => {
          if(res.length === 0)
            return curSql['thank_replies'].add({rid: reply_id, uid: user_id, thank: value});
          else {
            if(res[0].vote !== value)
              return curSql['thank_replies'].thanks({thank: value, rid: reply_id, uid: user_id});
            else
              return Promise.reject(error.votingNotAllowed);
          }
        })
        .then(res => {
          return curSql['replies'].thanks({rid: reply_id, thank: value});
        })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static getReplies(criticism_id){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql['replies'].get({cid: criticism_id})
        .then(res => {
          for(let item of res){
            let tempDate = moment(item.deadline).format('YYYY-M-D');
            let year = parseInt(tempDate.split('-')[0]);
            let month = parseInt(tempDate.split('-')[1]) - 1;
            let day = parseInt(tempDate.split('-')[2]);
            tempDate = jalali.toJalaali(year, month, day);
            item.deadline = tempDate.jy + '-' + tempDate.jm + '-' + tempDate.jd;
          }
          resolve(res);
        })
        .catch(err => {
          reject(err);
        })
    });
  }

  static saveReply(data, user_id){
    let curSql = Criticism.test ? sql.test : sql;
    let db = Criticism.test ? env.testDb : env.db;

    return new Promise((resolve, reject) => {
      console.log(data);
      let year = parseInt(data.deadline_date.split('-')[0]);
      let month = parseInt(data.deadline_date.split('-')[1]) - 1;
      let day = parseInt(data.deadline_date.split('-')[2]);
      if(jalali.isValidJalaaliDate(year, month, day)){
        //convert date to Gregorian
        let tempDate = jalali.toGregorian(year, month, day);
        let gregorianDate = moment(new Date(tempDate.gy, tempDate.gm, tempDate.gd)).format('YYYY-M-D');

        db.tx(t => {
          let queries = [];

          queries.push(t.query(env.pgp.helpers.insert({
            criticism_id: data.criticism_id,
            replyer_id: user_id,
            r_content: data.content,
            check_deadline: gregorianDate,
            rank: 0,
            thanks_number: 0
          }, null, 'replies')));
          queries.push(t.query('update criticisms set is_reject = true where cid = ' + data.criticism_id));

          return t.batch(queries);
        })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });

        // curSql['replies'].add()
        //   .then(res => {
        //     resolve(res);
        //   })
        //   .catch(err => {
        //     console.log(err);
        //     reject(err);
        //   })
      }
      else{
        reject(error.dateNotValid);
      }
    });
  }

  static backwardCriticism(data, criticism_id, user_id){
    let curSql = Criticism.test ? sql.test : sql;

    return new Promise((resolve, reject) => {
      curSql[criticismTable].backward({
        is_backward: data.is_backward,
        backward_reason: (data.is_backward) ? data.backward_reason : null,
        cid: criticism_id,
        uid: user_id
      })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        })
    });
  }
}

Criticism.test = false;
module.exports = Criticism;
