CREATE TABLE criticisms(
    cid serial not null primary key,
    creator_id integer not null references users(uid),
    subject varchar(255) not null references subjects(name) DEFERRABLE INITIALLY DEFERRED,
    c_content text not null,
    creation_date date not null default CURRENT_DATE,
    part integer not null references organ_parts(oid),
    rank smallint not null default 0,
    is_backward boolean default false,
    is_reject boolean not null default false,
    backward_reason text,
    parent integer
);


alter table criticisms add constraint parent_fkey foreign key (parent) references criticisms(cid);