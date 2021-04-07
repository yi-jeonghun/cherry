$('document').ready(function(){
	window._router = new Router().Init();
});

const _route_info = [
	{
		name:'kpop',
		target:'id_dst_kpop',
		view:'/kpop.vu'
	},
	{
		name:'pop',
		target:'id_dst_pop',
		view:'/pop.vu'
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

		if(path != null){
			self.LoadRoute(path);
		}
	};

	this.Go = function(path){
		{
			$('#nav_kpop').removeClass('active');
			$('#nav_pop').removeClass('active');
			switch(path){
				case 'kpop':
					$('#nav_kpop').addClass('active');
					break;
				case 'pop':
					$('#nav_pop').addClass('active');
					break;
			}
		}
		self.LoadRoute(path);
		history.pushState(null, '', "#"+path);
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
			$('#'+route.target).load(route.view);
			$('#'+route.target).css('display', '');
		}
	};

	this.OnPopState = function(event){
		var hash = document.location.hash;
		var path = null;

		console.log('hash ' + hash);
		var arr = hash.split('#');
		if(arr.length > 1){
			path = arr[1];
		}

		if(path != null){
			self.LoadRoute(path);
		}
	};
}