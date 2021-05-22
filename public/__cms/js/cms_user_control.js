$('document').ready(function(){
	window._user_control = new UserControl().Init();
});

const CMS_USER_LIST_TYPE = {
	ADMIN:0,
	DJ:1,
	USER:2
};

const DJ_EDIT_MODE = {
	NEW:0,
	EDIT:1
};

function UserControl(){
	var self = this;
	this._user_list = [];
	this._user_list_type = CMS_USER_LIST_TYPE.USER;
	this._dj_user_id_for_edit = null;
	this._dj_edit_mode = DJ_EDIT_MODE.NEW;

	this.Init = function(){
		self.InitHandle();
		self.GetUserList();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_cms_user_dj_ok').on('click', self.OnClick_id_btn_cms_user_dj_ok);
		$('#id_btn_cms_user_add_dj').on('click', self.OnClick_id_btn_cms_user_add_dj);
	};

	////////////////////////////////////////////////////////////////////

	this.OnClickTab = function(list_type){
		console.log('list_type ' + list_type);

		$('#id_tab_cms_user_user').removeClass('active');
		$('#id_tab_cms_user_dj').removeClass('active');
		$('#id_tab_cms_user_admin').removeClass('active');

		self._user_list_type = list_type;
		switch(self._user_list_type){
			case CMS_USER_LIST_TYPE.USER:
				$('#id_tab_cms_user_user').addClass('active');
				break;
			case CMS_USER_LIST_TYPE.DJ:
				$('#id_tab_cms_user_dj').addClass('active');
				break;
			case CMS_USER_LIST_TYPE.ADMIN:
				$('#id_tab_cms_user_admin').addClass('active');
				break;
		}
		this.GetUserList();
	};

	this.OnClick_id_btn_cms_user_add_dj = function(){
		self._dj_edit_mode = DJ_EDIT_MODE.NEW;
		$('#id_modal_cms_user_edit_dj').modal('show');
		$('#id_input_cms_user_dj_name').val('');
	};

	this.OnClickEditDJ = function(idx){
		self._dj_edit_mode = DJ_EDIT_MODE.EDIT;
		$('#id_modal_cms_user_edit_dj').modal('show');
		$('#id_input_cms_user_dj_name').val(self._user_list[idx].name);
		self._dj_user_id_for_edit = self._user_list[idx].user_id;
	};

	this.OnClick_id_btn_cms_user_dj_ok = function(){
		var name = $('#id_input_cms_user_dj_name').val().trim();
		if(name == ''){
			alert('name is empty');
			return;
		}

		var req_data = {
			user_id: self._dj_user_id_for_edit,
			name:    name
		};

		var url = '';
		if(self._dj_edit_mode == DJ_EDIT_MODE.NEW){
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
					self.GetUserList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	////////////////////////////////////////////////////////////////////

	this.GetUserList = function(){
		var list_type_str = 'user';
		switch(self._user_list_type){
			case CMS_USER_LIST_TYPE.USER:
				list_type_str = 'user';
				break;
			case CMS_USER_LIST_TYPE.DJ:
				list_type_str = 'dj';
				break;
			case CMS_USER_LIST_TYPE.ADMIN:
				list_type_str = 'admin';
				break;
		}

		console.log('list_type_str' + list_type_str);
		var req_data = {
			type:list_type_str
		};
		$.ajax({
			url: '/__cms_api/get_user_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._user_list = res.user_list;
					self.DISP_UserList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.MakeAdmin = function(user_id){
		console.log('user_id' + user_id);

		var req_data = {
			user_id:user_id
		};
		$.ajax({
			url: '/__cms_api/upgrade_user_to_admin',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._user_list = res.user_list;
					self.GetUserList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	//////////////////////////////////////////////////////////////////////

	this.DISP_UserList = function(){
		var h = `
		<table class="table table-sm table-srtiped">
		<tr>
			<th>User ID</th>
			<th>Name</th>
			<th></th>
		</tr>
		`;

		for(var i=0 ; i<self._user_list.length ; i++){
			var u = self._user_list[i];

			var btn_str = '';
			if(self._user_list_type == CMS_USER_LIST_TYPE.USER){
				btn_str += `
					<button type="button" class="btn btn-sm border" onclick="window._user_control.MakeAdmin('${u.user_id}')">Admin</button>
				`;
			}else if(self._user_list_type == CMS_USER_LIST_TYPE.DJ){
				btn_str += `
					<button type="button" class="btn btn-sm border" onclick="window._user_control.OnClickEditDJ('${i}')">Edit</button>
				`;
			}

			h += `
			<tr>
				<td>${u.user_id}</td>
				<td>${u.name}</td>
				<td>
					${btn_str}
				</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_cms_user_list').html(h);
	};
}