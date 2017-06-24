create table tags(
    tid serial not null primary key,
    name varchar(30) not null unique
)