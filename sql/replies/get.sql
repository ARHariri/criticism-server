select
    replies.rid as id,
    replies.criticism_id,
    users.name as creator_name,
    replies.r_content as content,
    replies.check_deadline as deadline,
    replies.rank as vote,
    replies.thanks_number
from replies
join users on replies.replyer_id = users.uid
where criticism_id = ${cid}