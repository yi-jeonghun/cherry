
//가라고 하는 곳으로 가기만 하게 만들자
//여기는 되도록이면 무뇌하게.
function Router(){
	var self = this;
	this._cur_path = '';

	this.Init = function(){
		window.addEventListener("popstate", self.OnPopState);
		self.ScrollEventHandle();
		return this;
	};

	this.GoHome = function(){
		self.Go(`/${window._country_code}/top_rank.go`);
	};

	this.LoadInitRoute = function(){
		var pathname = document.location.pathname;
		var search = document.location.search;
		if(pathname == '/'){
			self.Go(`/${window._country_code}/top_rank.go`);
		}else{
			var path = pathname + search;
			self.Go(path);
		}
	};

	this.Go = function(path){
		window.history.pushState('', '', path);
		self.Crossroad(path);
	};

	//path는 항상 다음의 형태
	//  /<2자리 국가코드>/<feature>.go?key=value&...
	this.Crossroad = function(path){
		self._cur_path = path;
		console.log('path ' + path);
		var path_after_cc = path.substr(4);
		var path_arr = path_after_cc.split('?');
		var feature = path_arr[0];
		console.log('feature ' + feature);

		var args = path_arr.length > 1 ? path_arr[1] : null;
		var arg_list = self.ParseArgs(args);

		{
			$('#id_router-top_rank').hide();
			$('#id_router-artist').hide();
			$('#id_router-search').hide();
		}

		switch(feature){
			case 'top_rank.go':
				$('#id_router-top_rank').show();
				self.GoTo_TopRank();
				break;
			case 'artist.go':
				$('#id_router-artist').show();
				self.GoTo_Artist(args, arg_list);
				break;
			case 'search.go':
				$('#id_router-search').show();
				self.GoTo_Search();
				break;
		}
	};

	this.GoTo_TopRank = function(){
		var country_name = COUNTRY_NAME_LIST[window._country_code];
		var title = country_name + ' Top 100 - Cherry Music [' + country_name + ']';
		var keywords = country_name + ' Top 100, ' + TR(L_TOP_RANK_META_KEYWORDS);
		var desc = country_name + TR(L_TOP_RANK_META_DESC);
		self.UpdateMeta(title, keywords, desc);

		var target_div = 'id_router-top_rank';
		var route_url = '/top_rank.vu';
		self.LoadInnerView(target_div, route_url);
	};

	this.GoTo_Artist = function(args, arg_list){
		var country_name = COUNTRY_NAME_LIST[window._country_code];
		var artist = arg_list['a'];
		var title = artist + ' - Cherry Music [' + country_name + ']';
		var keywords = artist + TR(L_ARTIST_META_KEYWORDS);
		var desc = artist + TR(L_ARTIST_META_DESC);
		this.UpdateMeta(title, keywords, desc);

		var target_div = 'id_router-artist';
		var route_url = '/artist.vu?'+args;
		self.LoadInnerView(target_div, route_url);
	};

	this.GoTo_Search = function(){
		var target_div = 'id_router-search';
		var route_url = '/search.vu';
		self.LoadInnerView(target_div, route_url);
	};
	this.UpdateMeta = function(title, keywords, desc){
		$('title').text(title);
		$("meta[property='og:title']").attr("content", title);

		$("meta[name=description]").attr("content", desc);
		$("meta[property='og:description']").attr("content", desc);

		$("meta[name=keywords]").attr("content", keywords);
	};

	this.ParseArgs = function(args){
		var ret = [];
		if(args == null){
			return ret;
		}

		var arg_list = args.split('&');
		for(var i=0 ; i<arg_list.length ; i++){
			var key_value = arg_list[i].split('=');
			if(key_value.length == 2){
				var key = key_value[0];
				var value = key_value[1];
				ret[key] = decodeURI(value);
			}
		}

		return ret;
	};

	this.LoadInnerView = function(target_div, route_url){
		$('#'+target_div).load(route_url, function(responseTxt, statusTxt, xhr){
			if(statusTxt == "success"){
				var key = 'SCORLL_TOP-' + self._cur_path;
				var scroll_top = window.localStorage.getItem(key);
				console.log('key ' + key + ' ; ' + scroll_top);

				$('.main_div').animate({
					scrollTop: scroll_top
				}, 'fast');
			}
		});
	};
	
	this.ScrollEventHandle = function(){
		$('.main_div').on('scroll', function(e) {
			var key = 'SCORLL_TOP-' + self._cur_path;
			var val = this.scrollTop;
			console.log(key + ' : ' + val);
			window.localStorage.setItem(key, val);
		});
	};

	this.OnPopState = function(event){
		console.log('OnPopState ' );
		var pathname = document.location.pathname;
		var search = document.location.search;
		var path = pathname + search;
		self.Crossroad(path);
	};
}