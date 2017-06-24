select *
from criticisms
join tags_criticisms on criticisms.cid = tags_criticisms.cid
join tags on tags_criticisms.tid = tags.tid
where creator_id = ${cid}