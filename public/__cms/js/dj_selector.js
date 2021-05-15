$('document').ready(function(){
	window._dj_selector = new DJSelector().Init();
});

function DJSelector(){
	var self = this;
	this._dj_list = [];
	this._dj_user_id = null;

	this.Init = function(){
		self.GetDJList();
		self.InitHandle();
		return self;
	};

	this.InitHandle = function(){
		$('#id_select_menu_dj_list').on('change', self.OnChange_id_select_menu_dj_list);
	};

	////////////////////////////////////////////////////////////////////

	this.OnChange_id_select_menu_dj_list = function(){
		self._dj_user_id = $('#id_select_menu_dj_list').val();
	};

	////////////////////////////////////////////////////////////////////

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
					self.DISP_DJList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	//////////////////////////////////////////////////////////////////////

	this.DISP_DJList = function(){
		var h = '<option value="-1">Choose DJ</option>';
		for(var i=0 ; i<self._dj_list.length ; i++){
			var dj = self._dj_list[i];
			h += `
			<option value="${dj.user_id}">${dj.name}</option>
			`;
		}
		$('#id_select_menu_dj_list').html(h);
	};
}