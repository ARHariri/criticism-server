CREATE TABLE criticisms(
    cid serial not null primary key,
    creator_id integer not null references users(uid),
    subject varchar(20) not null references subjects(name) DEFERRABLE INITIALLY DEFERRED,
    c_content text not null,
    creation_date date default CURRENT_DATE,
    rank smallint not null default 0,
    parent integer not null
);


alter table criticisms add constraint parent_fkey foreign key (parent) references criticisms(cid);