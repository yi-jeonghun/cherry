var https = require('https');
const source_url_list = require('./source');
var fs = require('fs');
var cc = require('../../public/js/const/country_code');

function TopRankParser(){
	var self = this;
	this._music_list = [];
	this.country_code = null;
	this._parser = null;
	this._source = null;

	this.Init = function(country_code, source){
		self._country_code = country_code;
		self._source = source;
		console.log('self._country_code ' + self._country_code);
		switch(self._country_code){
			case cc.COUNTRY_CODE.US:
			case cc.COUNTRY_CODE.GB:
			case cc.COUNTRY_CODE.DE:
			case cc.COUNTRY_CODE.FR:
			case cc.COUNTRY_CODE.AU:
			case cc.COUNTRY_CODE.CA:
			case cc.COUNTRY_CODE.KR:
			case cc.COUNTRY_CODE.BR:
				self._parser = require('./parser_apple_1');
				break;
			default:
				self._parser = require('./parser_apple_1');
				break;
		}
	};

	this.GetTop100 = async function(){
		return new Promise(async function(resolve, reject){
			try{
				self._music_list = [];
	
				var url = '';
				if(self._source == 'apple'){
					url = source_url_list[self._country_code].apple;
				}

				console.log('fatch html content from ' + url);
				var data = await self.FetchContentFromURL(url);
				console.log('parse ');
				self._music_list = await self._parser.Parse(data);
	
				resolve(self._music_list);
			}catch(err){
				console.log(err);
				reject(err);
			}
		});
	};

	this.SaveContent = async function(){
		return new Promise(async function(resolve, reject){
			var url = source_url_list[self._country_code].apple;
			var data = await self.FetchContentFromURL(url);
			var file_name = `test_data_${self._country_code}.txt`;
			fs.writeFile(file_name, data, function (err) {
				if (err) {
					console.log(err);
					reject(err);
				}
				console.log('file write success');
				resolve();
			});
		});
	};

	this.ReadTestData = async function(){
		return new Promise(function(resolve, reject){
			var file_name = `test_data_${self._country_code}.txt`;
			fs.readFile(file_name, 'utf8', function(err, data){		
				if(err){
					console.log(err);
					reject(err.message);
				}
				resolve(data);
			});
		});
	};

	this.Test = async function(){
		return new Promise(async function(resolve, reject){
			try{
				console.log('test ' );
				self._music_list = [];
				var data = await self.ReadTestData();
				console.log('ReadFile ' + data.length);

				console.log('parse ');
				self._music_list = await self._parser.Parse(data);
				console.log('after self._music_list ' + self._music_list.length);
		
				resolve(self._music_list);
			}catch(e){
				console.log(e);
			}
		});
	};

	this.FetchContentFromURL = async function(url){
		return new Promise(function(resolve, reject){
			var request = https.request(url, function (response) {
				var data = '';
				response.on('data', function (chunk) {
						data += chunk;
				});
				response.on('end', async function () {
					resolve(data);
				});
			});

			request.on('error', function (e) {
				console.log(e.message);
				reject(e);
			});
		
			request.end();
		});
	};


}

module.exports = new TopRankParser();