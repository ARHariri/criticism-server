CREATE TABLE users(
    uid serial not null primary key,
    name varchar(40) not null,
    username varchar(20) not null unique,
    password varchar(256) not null,
    email varchar(50) unique,
    pk varchar(60) not null unique,
    access_level integer not null,
    rank integer not null default 0
)