update rank_criticisms
set vote = vote + ${vote}
where cid = ${cid} and uid = ${uid}