create table access_levels(
    aid serial not null primary key,
    code integer not null unique,
    name varchar(20) not null unique
)