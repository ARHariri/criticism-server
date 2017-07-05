select
    criticisms.cid,
    criticisms.subject,
    criticisms.c_content as criticism_content,
    criticisms.creation_date,
    criticisms.rank,
    criticisms.is_backward,
    string_agg(tags.name, '-') as tags,
    organ_parts.name as part_name,
    users.name as replier_name,
    users.rank as replier_rank,
    replies.rid,
    replies.r_content as reply_content,
    replies.rank as reply_rank,
    replies.thanks_number
from criticisms
join replies on replies.criticism_id = criticisms.cid
join users on replies.replyer_id = users.uid
join organ_parts on criticisms.part = organ_parts.oid
left outer join tags_criticisms on tags_criticisms.cid = criticisms.cid
left outer join tags on tags.tid = tags_criticisms.tid
where check_deadline = ${deadline}
group by criticisms.cid, criticisms.subject, organ_parts.name, users.name, users.username, users.rank, replies.rid, replies.r_content, replies.thanks_number, replies.rank
order by creation_date