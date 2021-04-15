$('document').ready(function(){
	window._router = new Router().Init();
});

const _route_info = [
	{
		name:'GLO',
		target:'id_router_GLO',
		view:'/top_rank.vu?country_code=GLO'
	},
	{
		name:'KOR',
		target:'id_router_KOR',
		view:'/top_rank.vu?country_code=KOR'
	},
	{
		name:'USA',
		target:'id_router_USA',
		view:'/top_rank.vu?country_code=USA'
	},
];

function Router(){
	var self = this;

	this.Init = function(){
		window.addEventListener("popstate", self.OnPopState);
		self.LoadInitRoute();
		return this;
	};

	this.LoadInitRoute = function(){
		var hash = document.location.hash;
		var path = null;

		console.log('hash ' + hash);
		var arr = hash.split('#');
		if(arr.length > 1){
			path = arr[1];
		}

		console.log('path ' + path);

		if(path != null){
			self.Go(path);
		}else{
			document.location.href = "/#GLO";
		}
	};

	this.Go = function(path){
		var title = '';
		var keyword = '';
		{
			$('#nav_GLO').removeClass('active');
			$('#nav_USA').removeClass('active');
			$('#nav_KOR').removeClass('active');
			switch(path){
				case 'GLO':
					$('#nav_GLO').addClass('active');
					title = 'Global Top 100';
					keyword = 'Global Top 100';
					break;
				case 'KOR':
					$('#nav_KOR').addClass('active');
					title = 'Korea Top 100';
					keyword = 'Korea Top 100';
					break;
				case 'USA':
					$('#nav_USA').addClass('active');
					title = 'USA Top 100';
					keyword = 'USA Top 100';
					break;
				}
		}
		{
			$('title').text(title);
			$("meta[property='og:title']").attr("content", title);

			// $("meta[name=description]").attr("content", desc);
			// $("meta[property='og:description']").attr("content", desc);

			var org_keywords = $("meta[name=keywords]").attr("content");
			var new_keywords = keyword + ', ' + org_keywords;
			$("meta[name=keywords]").attr("content", new_keywords);
		}
		self.LoadRoute(path);
	};

	/*
	 * 해당 router만 visible하고
	 * 다른 router들은 hide하기.
	 */
	this.LoadRoute = function(path){
		var route = null;

		for(var i=0 ; i<_route_info.length ; i++){
			$('#' + _route_info[i].target).css('display', 'none');
			if(_route_info[i].name == path){
				route = _route_info[i];
			}
		}

		if(route != null){
			console.log('load route ' + route.view);
			$('#'+route.target).load(route.view);
			$('#'+route.target).css('display', '');
		}
	};

	this.OnPopState = function(event){
		console.log('OnPopState ' );
		var hash = document.location.hash;
		var path = null;

		console.log('hash ' + hash);
		var arr = hash.split('#');
		if(arr.length > 1){
			path = arr[1];
		}

		if(path != null){
			self.Go(path);
		}
	};
}