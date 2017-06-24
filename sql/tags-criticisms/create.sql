create table tags_criticisms(
    cid integer not null references criticisms(cid),
    tid integer not null references tags(tid),
    primary key(cid, tid)
)