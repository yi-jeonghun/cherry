#!/bin/sh

NODE_MAIN="node app.js"

if [ -z `pgrep -f -x "$NODE_MAIN"` ]
then
	echo "Uglify"
	cd /home/ubuntu/cherry/public/js
	terser \
		youtube_iframe_player.js \
		control.js \
		router.js \
		cherry_player.js \
		-o index_min.js -c -m

	echo "Restarting $NODE_MAIN."
	cd /home/ubuntu/cherry/
	#cmdNODE="$NODE_MAIN &"
	cmdNODE="$NODE_MAIN 1> /var/log/node/node.log 2> /var/log/node/error.log &"
	eval $cmdNODE
fi
