create table organ_parts(
    oid serial not null primary key,
    name not null unique,
    responsible_id integer not null reference users(uid)
)