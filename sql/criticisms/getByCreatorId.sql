select
    criticisms.cid,
    criticisms.subject,
    criticisms.c_content as content,
    criticisms.creation_date,
    criticisms.rank,
    criticisms.is_backward,
    criticisms.backward_reason,
    criticisms.is_reject,
    string_agg(tags.name, '-') as tags,
    cparent.subject as parent_criticism,
    cparent.cid as parent_cid,
    organ_parts.name as part_name
from criticisms
left outer join criticisms as cparent on criticisms.parent = cparent.cid
join organ_parts on criticisms.part = organ_parts.oid
left outer join tags_criticisms on tags_criticisms.cid = criticisms.cid
left outer join tags on tags.tid = tags_criticisms.tid
where criticisms.creator_id = ${uid}
group by criticisms.cid, cparent.cid, cparent.subject, organ_parts.name
order by creation_date