$('document').ready(function(){
	window._dj_selector = new DJSelector().Init();
});

const DJ_SELECTOR_TYPE = {
	FIXED:0,
	RANDOM:1
};

function DJSelector(){
	var self = this;
	this._dj_list = [];
	this._dj_user_id = null;
	this._dj_selector_type = DJ_SELECTOR_TYPE.FIXED;

	this.Init = function(){
		self.InitHandle();

		{
			var dj_selector_type = window.localStorage.getItem('CMS_DJ_SELECTOR_TYPE');
			console.log('dj_selector_type ' + dj_selector_type);
			if(dj_selector_type != null){
				self._dj_selector_type = dj_selector_type;
				console.log('dj_selector_type ' + dj_selector_type);
			}
			self.HighlightDJSelectorType();

			var dj_user_id_from_local_storage = window.localStorage.getItem('CMS_FIXED_DJ_USER_ID');
			if(self._dj_selector_type == DJ_SELECTOR_TYPE.FIXED){
				if(dj_user_id_from_local_storage != null){
					self._dj_user_id = dj_user_id_from_local_storage;
				}
			}
		}

		self.GetDJList();

		return self;
	};

	this.InitHandle = function(){
		$('#id_select_menu_dj_list').on('change', self.OnChange_id_select_menu_dj_list);
		$('#id_btn_cms_dj_selector_fixed').on('click', self.OnClick_Fixed);
		$('#id_btn_cms_dj_selector_random').on('click', self.OnClick_Random);
		$('#id_btn_cms_dj_selector_refresh').on('click', self.OnClick_Refresh);
	};

	////////////////////////////////////////////////////////////////////

	this.OnClick_Refresh = function(){
		self.RandomSelectDJ();
		self.DISP_DJList();
	};

	this.OnChange_id_select_menu_dj_list = function(){
		var val = $('#id_select_menu_dj_list').val();
		if(val == -1){
			val = null;
		}
		self._dj_user_id = val;
		if(self._dj_selector_type == DJ_SELECTOR_TYPE.FIXED){
			window.localStorage.setItem('CMS_FIXED_DJ_USER_ID', self._dj_user_id);
		}
	};

	this.OnClick_Fixed = function(){
		self._dj_selector_type = DJ_SELECTOR_TYPE.FIXED;
		window.localStorage.setItem('CMS_DJ_SELECTOR_TYPE', self._dj_selector_type);
		self.HighlightDJSelectorType();
	};

	this.OnClick_Random = function(){
		self._dj_selector_type = DJ_SELECTOR_TYPE.RANDOM;
		window.localStorage.setItem('CMS_DJ_SELECTOR_TYPE', self._dj_selector_type);
		self.HighlightDJSelectorType();
	};

	////////////////////////////////////////////////////////////////////

	this.HighlightDJSelectorType = function(){
		$('#id_btn_cms_dj_selector_fixed').removeClass('badge-primary');
		$('#id_btn_cms_dj_selector_random').removeClass('badge-primary');

		if(self._dj_selector_type == DJ_SELECTOR_TYPE.FIXED){
			$('#id_btn_cms_dj_selector_fixed').addClass('badge-primary');
		}else{
			$('#id_btn_cms_dj_selector_random').addClass('badge-primary');
		}
	};

	this.GetDJList = function(){
		$.ajax({
			url:  '/__cms_api/dj/get_dj_list',
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._dj_list = res.dj_list;
					console.log('self._dj_selector_type ' + self._dj_selector_type);
					if(self._dj_selector_type == DJ_SELECTOR_TYPE.RANDOM){
						self.RandomSelectDJ();
					}
					self.DISP_DJList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.RandomSelectDJ = function(){
		var min = 0;
		var max = self._dj_list.length - 1;
		var random_idx = Math.floor(Math.random() * (max - min)) + min;
		console.log('random_idx ' + random_idx);
		self._dj_user_id = self._dj_list[random_idx].user_id;
		console.log('random user ' + self._dj_user_id);
	};

	//////////////////////////////////////////////////////////////////////

	this.DISP_DJList = function(){
		var h = '<option value="-1">Choose DJ</option>';
		for(var i=0 ; i<self._dj_list.length ; i++){
			var dj = self._dj_list[i];
			var selected_str = '';
			if(dj.user_id == self._dj_user_id){
				selected_str = ' selected ';
			}

			h += `
			<option value="${dj.user_id}" ${selected_str}>${dj.name}</option>
			`;
		}
		$('#id_select_menu_dj_list').html(h);
	};

	///////////////////////////////////////////////////////////////////////

	this.API_Get_Choosed_DJs_UserID = function(){
		return self._dj_user_id;
	};
}