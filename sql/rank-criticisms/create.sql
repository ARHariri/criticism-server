create table rank_criticisms(
     uid integer not null references users(uid),
     cid integer not null references criticisms(cid),
     primary key(uid, cid)
)