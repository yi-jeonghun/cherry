#!/bin/sh
#0 0 * * * /home/ubuntu/cherry/script/backup.sh

mysqldump -u _cherry_ -pCherryMaster --databases cherry | bzip2 -c > /home/ubuntu/backup/dump_$(date +%Y-%m-%d-%H.%M.%S).sql.bz2