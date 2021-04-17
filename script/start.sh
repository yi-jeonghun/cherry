#!/bin/sh

NODE_MAIN="node app.js"

if [ -z `pgrep -f -x "$NODE_MAIN"` ]
then
    echo "Restarting $NODE_MAIN."
    cd /home/ubuntu/cherry/
    #cmdNODE="$NODE_MAIN &"
    cmdNODE="$NODE_MAIN 1> /var/log/node/node.log 2> /var/log/node/error.log &"
    eval $cmdNODE
fi
