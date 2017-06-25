create table organ_parts(
    oid serial not null primary key,
    name varchar(20) not null unique,
    responsible_id integer not null references users(uid)
)