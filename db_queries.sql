


# View 생성한 쿼리.
서버에 접속하여 _cherry_ 계정으로 로그인한 후에 
아래 쿼리를 실행해야만 함.
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




GRANT ALL PRIVILEGES ON * . * TO 'golden'@'%';


CREATE USER '_cherry_'@'localhost' IDENTIFIED BY 'CherryMaster';
drop user '_cherry_'@'localhost';
GRANT ALL PRIVILEGES ON cherry.* TO '_cherry_'@'localhost';

GRANT SELECT ON cherry.va_member_view TO '_cherry_'@'localhost' IDENTIFIED BY 'CherryMaster';



=======================================

root / RmxRkwlrksek.

sudo mysql -u root


[사용자 추가]
create user '_cherry_'@'localhost' identified by 'CherryMaster';
ALTER USER '_cherry_'@'localhost' IDENTIFIED WITH mysql_native_password BY 'CherryMaster';
grant all privileges on cherry.* to '_cherry_'@'localhost';



[작업용 임시 사용자 추가]
create user '_cherry_'@'175.116.147.47' identified by 'CherryMaster';
grant all privileges on cherry.* to '_cherry_'@'175.116.147.47';


[작업용 임시 사용자 삭제]
drop user '_cherry_'@'175.116.147.47';





[서버주소 변경]
sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf


[재시작]
sudo service mysql stop
sudo service mysql start
sudo service mysql restart


[Backup]
script로 백업을 실행하는데 아래 오류가 발생
--
mysqldump: [Warning] Using a password on the command line interface can be insecure.
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces
--
그래서 다음과 같이 _cherry_ 사용자에게 권한 부여함.
GRANT PROCESS ON *.* TO _cherry_@localhost;


[IP주소]
175.116.147.47