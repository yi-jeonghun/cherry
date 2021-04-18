$('document').ready(function(){
	window._router = new Router().Init();
});

function Router(){
	var self = this;

	this.Init = function(){
		window.addEventListener("popstate", self.OnPopState);
		self.LoadInitRoute();
		return this;
	};

	this.LoadInitRoute = function(){
		var pathname = document.location.pathname;
		var search = document.location.search;
		if(pathname == '/'){
			self.Go('/top_rank.go?c=GLO');
		}else{
			var path = pathname + search;
			self.Go(path);
		}
	};

	this.Go = function(path){
		window.history.pushState('', '', path);
		self.Crossroad(path);
	};

	this.Crossroad = function(path){
		var path_arr = path.split('?');
		var feature = path_arr[0];
		console.log('feature ' + feature);

		var args = path_arr.length > 1 ? path_arr[1] : null;
		var arg_list = self.ParseArgs(args);

		if(feature == '/top_rank.go'){
			var country_code = arg_list['c'];
			self.GoTo_TopRank(country_code);
		}
	};

	this.GoTo_TopRank = function(country_code){
		console.log('country_code ' + country_code);
		{
			//Nav Bar Initialize
			for(var i=0 ; i<window._const._top_rank_country_list.length ; i++){
				$('#nav_'+window._const._top_rank_country_list[i].country_code).removeClass('active');
			}
		}

		$('#nav_'+country_code).addClass('active');

		var title = '';
		var keyword = '';
		var route_url = '';

		for(var i=0 ; i<window._const._top_rank_country_list.length ; i++){
			if(window._const._top_rank_country_list[i].country_code == country_code){
				country_name = window._const._top_rank_country_list[i].country_name;
				title = country_name + ' Top 100';
				keyword = country_name + ' Top 100';
				route_url = window._const._top_rank_country_list[i].route_url;
			}
		}

		{
			//Update Meta Tag
			$('title').text(title);
			$("meta[property='og:title']").attr("content", title);

			//TODO
			// $("meta[name=description]").attr("content", desc);
			// $("meta[property='og:description']").attr("content", desc);

			var org_keywords = $("meta[name=keywords]").attr("content");
			var new_keywords = keyword + ', ' + org_keywords;
			$("meta[name=keywords]").attr("content", new_keywords);
		}

		var target_div = 'id_router-top_rank';
		self.LoadInnerView(target_div, route_url);
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
				ret[key] = value;
			}
		}

		return ret;
	};

	this.LoadInnerView = function(target_div, route_url){
		$('#'+target_div).load(route_url);
	};

	this.OnPopState = function(event){
		console.log('OnPopState ' );
		var pathname = document.location.pathname;
		var search = document.location.search;
		var path = pathname + search;
		self.Crossroad(path);
	};
}