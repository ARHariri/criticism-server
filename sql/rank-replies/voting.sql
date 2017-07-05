update rank_replies
set vote = vote + ${vote}
where rid = ${rid} and uid = ${uid}