create table thank_replies(
    uid integer not null references users(uid),
    rid integer not null references replies(rid),
    thank smallint not null,
    primary key(uid, rid)
)