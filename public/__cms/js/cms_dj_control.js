$('document').ready(function(){
	window._cms_dj_control = new CMSDJControl().Init();
});

var EDIT_MODE = {
	NEW:0,
	EDIT:1
};

function CMSDJControl(){
	var self = this;
	this._dj_list = [];
	this._edit_mode = EDIT_MODE.NEW;
	this._user_id_for_edit = null;

	this.Init = function(){
		self.InitHandle();
		self.GetDJList();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_cms_dj_add').on('click', self.OnClick_id_btn_cms_dj_add);
		$('#id_btn_cms_dj_add_ok').on('click', self.OnClick_id_btn_cms_dj_add_ok);
	};

	//////////////////////////////////////////////////////////////

	this.OnClick_id_btn_cms_dj_add = function(){
		self._edit_mode = EDIT_MODE.NEW;
		$('#id_input_cms_dj_name').val('');
		$('.modal').modal('show');
	};

	this.OnClick_id_btn_cms_dj_add_ok = function(){
		var name = $('#id_input_cms_dj_name').val().trim();
		if(name == ''){
			alert('name is empty');
			return;
		}

		var req_data = {
			user_id: self._user_id_for_edit,
			name:    name
		};

		var url = '';
		if(self._edit_mode == EDIT_MODE.NEW){
			url = '/__cms_api/dj/add_dj';
		}else{
			url = '/__cms_api/dj/edit_dj';
		}

		$.ajax({
			url: url,
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				$('.modal').modal('hide');
				if(res.ok){
					self.GetDJList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.OnClick_Edit = function(idx){
		self._edit_mode = EDIT_MODE.EDIT;
		var dj = self._dj_list[idx];
		$('#id_input_cms_dj_name').val(dj.name);
		self._user_id_for_edit = dj.user_id;
		$('.modal').modal('show');
	};

	//////////////////////////////////////////////////////////////

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

	//////////////////////////////////////////////////////////////

	this.DISP_DJList = function(){
		var h = `
		<table class="table table-striped">
			<tr>
				<th>User ID</th>
				<th>Name</th>
				<td></td>
			</tr>
		`;

		for(var i=0 ; i<self._dj_list.length ; i++){
			var dj = self._dj_list[i];
			var on_click = `window._cms_dj_control.OnClick_Edit(${i})`;

			h += `
				<tr>
					<td>${dj.user_id}</td>
					<td>${dj.name}</td>
					<td><a style="cursor:pointer" onClick="${on_click}">[Edit]</a></td>
				</tr>
			`;
		}

		h += '</table>';

		$('#id_div_cms_dj_list').html(h);
	};
}