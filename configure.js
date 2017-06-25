/**
 * Created by Amin on 31/01/2017.
 */
const env = require('./env');
const sql = require('./sql');
const lib = require('./lib');
const User = lib.User;

function dbTestCreate() {
  return new Promise((resolve, reject) => {
    sql.db.create({dbName: env.test_db_name}, true)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}

function createOrExist(tableName) {
  return new Promise((resolve, reject) => {
    sql[tableName].create()
      .then(resolve)
      .catch(err => {
        if (err.message.indexOf(`"${tableName}" already exists`) !== -1)
          resolve();
        else
          reject(err);
      })
  })
}

function prodTablesCreate() {
  return new Promise((resolve, reject) => {
    createOrExist('users')
      .then((res) => createOrExist('subjects'))
      .then((res) => createOrExist('criticisms'))
      .then((res) => createOrExist('access_levels'))
      .then((res) => createOrExist('organ_parts'))
      .then((res) => createOrExist('tags'))
      .then((res) => createOrExist('replies'))
      .then((res) => createOrExist('rank_replies'))
      .then((res) => createOrExist('rank_criticisms'))
      .then((res) => createOrExist('tags_criticisms'))
      .then((res) => adminRowCreate())
      .catch((err) => {
        reject(err);
      });
  });
}

function adminRowCreate() {
  return new Promise((resolve, reject) => {
    let user = new User();

    let data = {
      name: 'admin',
      username: 'admin',
      password: 'admin',
      email: 'admin@admin.com',
      access_level: 10,
      rank: 0
    };

    user.insert(data)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function setupMainDatabase(msg) {
  console.log(msg);
  prodTablesCreate()
    .then(() => {
      return adminRowCreate();
    })
    .then(() => {
      if (env.isDev)
        return dbTestCreate();
      else
        process.exit();
    })
    .then(() => process.exit())
    .catch((err) => {
      console.log(err.message);
      process.exit();
    });
}

if (env.isDev) {
  sql.db.create({dbName: env.db_name})
    .then(res => {
      setupMainDatabase(res);
    })
    .catch(err => {
      setupMainDatabase(err.message);
    });
}