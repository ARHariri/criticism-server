create table subjects(
    sid serial not null primary key,
    name varchar(255) unique not null
)