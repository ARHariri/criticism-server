CREATE TABLE criticism(
    cid serial not null primary key,
    creator_id integer not null references users(uid),
    subject varchar(20) not null references subjects(name) DEFERRABLE INITIALLY DEFERRED,
    content text not null primary key,
    creation_date date default CURRENT_DATE,
    rank smallint not null default 0,
    parent integer references criticisms(cid),

)