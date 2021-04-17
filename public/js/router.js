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
		var hash = document.location.hash;
		var country_code = hash.substr(1);

		if(country_code != ''){
			self.Go(country_code);
		}else{
			document.location.href = "/#GLO";
		}
	};

	this.Go = function(country_code){
		{
			//Nav Bar Initialize
			for(var i=0 ; i<window._const._top_rank_country_list.length ; i++){
				$('#nav_'+window._const._top_rank_country_list[i].country_code).removeClass('active');
			}
		}

		$('#nav_'+country_code).addClass('active');

		var title = '';
		var keyword = '';

		for(var i=0 ; i<window._const._top_rank_country_list.length ; i++){
			if(window._const._top_rank_country_list[i].country_code == country_code){
				country_name = window._const._top_rank_country_list[i].country_name;
				title = country_name + ' Top 100';
				keyword = country_name + ' Top 100';
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
		self.LoadRoute(country_code);
	};

	this.LoadRoute = function(country_code){
		for(var i=0 ; i<window._const._top_rank_country_list.length ; i++){
			if(window._const._top_rank_country_list[i].country_code == country_code){
				$('#id_router-top_rank').load(window._const._top_rank_country_list[i].route_url);
				break;
			}
		}
	};

	this.OnPopState = function(event){
		console.log('OnPopState ' );
		var hash = document.location.hash;
		var country_code = hash.substr(1);

		if(country_code != ''){
			self.Go(country_code);
		}
	};
}