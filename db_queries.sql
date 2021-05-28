


# View 생성한 쿼리.
CREATE OR REPLACE VIEW va_member_view AS
SELECT  av.artist_uid, group_concat( '{"artist_uid":"', av.member_artist_uid, '","name":"', a.name, '"}') as member_list_json
FROM artist_various av
JOIN artist a ON a.artist_uid=av.member_artist_uid
group by av.artist_uid
;




# VIEW 생성한 이후에 view 접근 권한이 없어서 오류가 발생함.
# 아래와 같이 쿼리를 직접 실행하여 해결하였음.
show grants for '_cherry_'@'localhost';
select user, host, Show_view_priv from mysql.user;
update mysql.user set show_view_priv='Y' where user='_cherry_';