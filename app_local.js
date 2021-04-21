const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const session = require('express-session');
const mysql_store = require('express-mysql-session')(session);
var body_parser = require('body-parser');

const session_store = new mysql_store({
	host: 'localhost',
	port: 3306,
	user: '_cherry_',
	password: 'CherryMaster',
	database: 'cherry',
});

var cherry_api = require('./server/cherry_api');
var cms_api = require('./server/cms_api');
var auth_api = require('./server/auth_api');

var view_router = require('./server/view_router');
// var cms_router = require('./server/cms_router');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './view');

http.createServer(app).listen(80);

// https.createServer({
// 	key: fs.readFileSync('/etc/letsencrypt/live/kpopschool.net/privkey.pem'),
// 	cert: fs.readFileSync('/etc/letsencrypt/live/kpopschool.net/fullchain.pem')
// }, app).listen(443);

// app.use(function (req, res, next) {
// 	if (!req.secure) {
// 		res.redirect("https://" + req.headers.host + req.url);
// 	} else {
// 		return next();
// 	}
// });

app.use(session({
	key: 'session_cookie_name',
	secret: '@#@$MYSIGN#@$#$',
	store: session_store,
	resave: false,
	saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));
app.use(body_parser.json());
//-- APIs-------------------------------------
app.use('/cherry_api', cherry_api);
app.use('/auth_api', auth_api);
app.use('/__cms_api', cms_api);
// //-- Routers----------------------------------
app.use('/', view_router);
// app.use('/', cms_router);
