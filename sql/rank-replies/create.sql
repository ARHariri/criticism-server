create table rank_replies(
    uid integer not null references users(uid),
    rid integer not null references replies(rid),
    vote smallint not null,
    primary key(uid, rid)
)