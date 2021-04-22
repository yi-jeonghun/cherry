$('document').ready(function(){
	new Control().Init();
});

function SelectMusic(id){
	window._cherry_player.SelectMusic(id);
}

function Control(){
	var self = this;

	this.Init = function(){
		self.InitComponentHandle();
		return self;
	};

	this.InitComponentHandle = function(){
		console.log('InitComponentHandle ' );
		$('#id_btn_menu_open').on('click', self.OpenMenu);
		$('#id_btn_close_menu').on('click', self.CloseMenu);
	};

	this.OpenMenu = function(){
		$('#id_menu_div').show();
	};

	this.CloseMenu = function(){
		$('#id_menu_div').hide();
	};
}