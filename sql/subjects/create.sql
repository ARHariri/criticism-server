create table subjects(
    sid serial not null primary key,
    name varchar(20) unique not null
)