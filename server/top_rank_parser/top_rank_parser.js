var https = require('https');
const source_url_list = require('./source');
var fs = require('fs');
var cc = require('../../public/js/const/country_code');
const util = require('util');
const exec_async = util.promisify(require('child_process').exec);
const read_file_async = util.promisify(fs.readFile);

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
		console.log('source ' + source);
		if(source == 'apple'){
			self._parser = require('./parser_apple_1');
		}else if(source == 'melon'){
			self._parser = require('./parser_melon');
		}
	};

	this.GetTop100 = async function(){
		return new Promise(async function(resolve, reject){
			try{
				self._music_list = [];
	
				var url = '';
				var data = null;
				if(self._source == 'apple'){
					url = source_url_list[self._country_code].apple;
					data = await self.FetchContentFromURL(url);
				}else if(self._source == 'melon'){
					url = source_url_list[self._country_code].melon;
					data = await self.WGet(url);
				}

				console.log('parse ');
				self._music_list = await self._parser.Parse(data);
	
				resolve(self._music_list);
			}catch(err){
				console.log(err);
				reject(err);
			}
		});
	};

	/**
	 * 로컬에서 쉽게 테스트하기 위해 HTML 본문을 파일로 저장한다.
	 * @returns 
	 */
	this.SaveContent = async function(){
		return new Promise(async function(resolve, reject){
			try{
				console.log('SaveContent ');
				var url = '';
				var data = '';
				if(self._source == 'apple'){
					url = source_url_list[self._country_code].apple;
					data = await self.FetchContentFromURL(url);
				}else if('melon'){
					url = source_url_list[self._country_code].melon;
					data = await self.WGet(url);
				}
	
				console.log('data len ' + data.length);
	
				var file_name = `test_data_${self._country_code}_${self._source}.txt`;
				fs.writeFile(file_name, data, function (err) {
					if (err) {
						console.log(err);
						reject(err);
					}
					console.log('file write success');
					resolve();
				});	
			}catch(err){
				console.log('Fail ' + err);
				reject(err);
			}
		});
	};

	/**
	 * 실제 site가 아닌 local test용 file에서 HTML 본문을 읽어온다.
	 * FetchContentFromURL() 함수의 로컬 버전
	 * @returns 
	 */
	this.ReadTestData = async function(){
		return new Promise(function(resolve, reject){
			var file_name = `test_data_${self._country_code}_${self._source}.txt`;
			fs.readFile(file_name, 'utf8', function(err, data){		
				if(err){
					console.log(err);
					reject(err.message);
				}
				resolve(data);
			});
		});
	};

	/**
	 * Unit Test 함수
	 * @returns music_list
	 */
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

	/**
	 * URL로 부터 HTML를 가져오는 기능
	 * @param {*} url 
	 * @returns site의 html 본문 
	 */
	this.FetchContentFromURL = async function(url){
		return new Promise(function(resolve, reject){
			console.log('fetch url ' + url);
			var request = https.request(url, function (response) {
				var data = '';
				response.on('data', function (chunk) {
					// console.log('chunk ' + chunk);
					data += chunk;
				});
				response.on('end', async function () {
					// console.log('on end ' );
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

	this.WGet = async function(url){
		return new Promise(async function(resolve, reject){
			var output_file = 'tmp.html';
			var cmd = `wget ${url} -O ${output_file}`;
			console.log('cmd ' + cmd);
			try{
				const { stdout, stderr } = await exec_async(cmd);
				var data = await read_file_async(output_file, 'utf8');
				resolve(data);
			}catch(err){
				console.log('FAIL to run wget ' + err);
				reject(err);
			}
		});
	};
}

module.exports = new TopRankParser();