$('document').ready(function(){
	new Control().Init();
});

function SelectMusic(id){
	window._cherry_player.SelectMusic(id);
}

function Control(){
	var self = this;

	this.Init = function(){
		return self;
	};
}