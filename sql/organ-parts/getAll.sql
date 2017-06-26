select child.oid as id, child.name, child.responsible_id, users.name as responsible_name, users.username, users.email, parent.name as parent_name
from organ_parts as child
join users on child.responsible_id = users.uid
left outer join organ_parts as parent on child.parent_organ = parent.oid
