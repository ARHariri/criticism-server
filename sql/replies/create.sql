create table replies(
    rid serial not null primary key,
    criticism_id integer not null references criticisms(cid),
    replyer_id integer not null references users(uid),
    r_content text not null,
    check_deadline date,
    rank integer default 0,
    thanks_number integer default 0
)