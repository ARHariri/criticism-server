create table access_levels(
    aid serial not null primary key,
    code integer not null unique,
    name varchar(20) not null unique
);

insert into access_levels(code, name) values(1, 'مدیر');
insert into access_levels(code, name) values(2, 'پاسخگو');
insert into access_levels(code, name) values(3, 'عادی');