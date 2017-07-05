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
    getAll:         sql('criticisms/getAll.sql'),
    ranking:        sql('criticisms/ranking.sql'),
    getNotReply:    sql('criticisms/getNotReply.sql'),
    getTheBest:     sql('criticisms/getTheBest.sql'),
    backward:       sql('criticisms/backward.sql'),
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
    get:            sql('rank-criticisms/get.sql'),
    voting:         sql('rank-criticisms/voting.sql'),
  },
  rank_replies: {
    create:         sql('rank-replies/create.sql'),
    drop:           sql('rank-replies/drop.sql'),
    get:            sql('rank-replies/get.sql'),
    voting:         sql('rank-replies/voting.sql'),
  },
  replies: {
    create:         sql('replies/create.sql'),
    drop:           sql('replies/drop.sql'),
    get:            sql('replies/get.sql'),
    getDeadLines:   sql('replies/getDeadLines.sql'),
    ranking:        sql('replies/ranking.sql'),
    thanks:         sql('replies/thanks.sql'),
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
  thank_replies: {
    create:         sql('thank-replies/create.sql'),
    drop:           sql('thank-replies/drop.sql'),
    get:            sql('thank-replies/get.sql'),
    thanks:         sql('thank-replies/thanks.sql'),
  },
  users: {
    create:         sql('users/create.sql'),
    drop:           sql('users/drop.sql'),
    getByUsername:  sql('users/getByUsername.sql'),
    getTopTen:      sql('users/getTopTen.sql'),
    select:         sql('users/select.sql'),
  },
};