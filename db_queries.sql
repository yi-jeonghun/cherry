CREATE OR REPLACE VIEW va_member_view AS
SELECT  av.artist_uid, group_concat( '{"id":"', av.member_artist_uid, '","name":"', a.name, '"}') as member_list_json
FROM artist_various av
JOIN artist a ON a.artist_uid=av.member_artist_uid
group by av.artist_uid
;
