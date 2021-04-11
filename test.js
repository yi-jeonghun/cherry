var https = require('https');

// var options = {
//     host: 'music.apple.com',
//     path: '/us/playlist/top-100-global/pl.d25f5d1181894928af76c85c967f8f31'
// };

var url = 'https://music.apple.com/us/playlist/top-100-global/pl.d25f5d1181894928af76c85c967f8f31';

var request = https.request(url, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        console.log(data);
    });
});

request.on('error', function (e) {
    console.log(e.message);
});

request.end();