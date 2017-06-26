create table organ_parts(
    oid serial not null primary key,
    name varchar(20) not null unique,
    responsible_id integer not null references users(uid),
    parent_organ integer
);

alter table organ_parts add constraint parent_fkey foreign key (parent_organ) references organ_parts(oid);