/**
 * Created by Amin on 01/02/2017.
 */
const env = require('../env');
const QueryFile = env.pgp.QueryFile;
const path = require('path');

// Helper for linking to external query files:
function sql(file) {
  let fullPath = path.join(__dirname, file); // generating full path;
  return new QueryFile(fullPath, {minify: true, debug: env.isDev});
}
/*
 * Add any new queries with nesting it in table then query name, then point to the SQL file for the query.
 * Do not forget to wrap the filename in 'sql()' function.
 * Put the SQL files for any new table/schema in a new directory
 * Use the same direcoty name for nesting the queries here.
 */
module.exports = {
  access_levels: {
    create:         sql('access-levels/create.sql'),
    drop:           sql('access-levels/drop.sql'),
    getAll:         sql('access-levels/getAll.sql'),
  },
  criticisms: {
    create:         sql('criticisms/create.sql'),
    drop:           sql('criticisms/drop.sql'),
    getByCreatorId: sql('criticisms/getByCreatorId.sql'),
  },
  db: {
    create:         sql('db/create.sql'),
    drop:           sql('db/drop.sql'),
    test:           sql('db/test.sql'),
  },
  organ_parts: {
    create:         sql('organ-parts/create.sql'),
    drop:           sql('organ-parts/drop.sql'),
    getAll:         sql('organ-parts/getAll.sql'),
  },
  rank_criticisms: {
    create:         sql('rank-criticisms/create.sql'),
    drop:           sql('rank-criticisms/drop.sql'),
  },
  rank_replies: {
    create:         sql('rank-replies/create.sql'),
    drop:           sql('rank-replies/drop.sql'),
  },
  replies: {
    create:         sql('replies/create.sql'),
    drop:           sql('replies/drop.sql'),
  },
  subjects: {
    create:         sql('subjects/create.sql'),
    drop:           sql('subjects/drop.sql'),
  },
  tags: {
    create:         sql('tags/create.sql'),
    drop:           sql('tags/drop.sql'),
    getAll:         sql('tags/getAll.sql'),
  },
  tags_criticisms: {
    create:         sql('tags-criticisms/create.sql'),
    drop:           sql('tags-criticisms/drop.sql'),
    getAll:         sql('tags-criticisms/getAll.sql'),
  },
  users: {
    create:         sql('users/create.sql'),
    drop:           sql('users/drop.sql'),
    getByUsername:  sql('users/getByUsername.sql'),
    getTopTen:      sql('users/getTopTen.sql'),
    select:         sql('users/select.sql'),
  },
};