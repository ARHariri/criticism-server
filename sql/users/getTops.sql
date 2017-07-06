select users.*, ranked.rank, ranked.is_backward
from users
join (select criticisms.creator_id,
             sum(criticisms.rank) as rank,
             sum(case when criticisms.is_backward = true then 1 else 0 end) as is_backward,
             sum(replies.rank) as replies_rank,
             sum(replies.thanks_number) as replies_thanks_number,
             sum(case when criticisms.is_reject = true then 1 else 0 end) as is_rejected
      from criticisms
      left outer join replies on criticisms.cid = replies.criticism_id
      group by criticisms.creator_id) as ranked on users.uid = ranked.creator_id
order by ranked.rank DESC, ranked.is_backward ASC, ranked.is_rejected ASC, ranked.replies_rank DESC, ranked.replies_thanks_number DESC
limit 9