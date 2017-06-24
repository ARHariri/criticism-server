create table rank_replies(
    uid integer not null references users(uid),
    rid integer not null references replies(rid),
    primary key(uid, rid)
)