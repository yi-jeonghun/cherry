$('document').ready(function(){
	window._user_control = new UserControl().Init();
});

function UserControl(){
	var self = this;
	this._user_list = [];

	this.Init = function(){
		self.GetUserList();
		return self;
	};

	this.GetUserList = function(){
		var req_data = {};
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

	//////////////////////////////////////////////////////////////////////

	this.DISP_UserList = function(){
		var h = `
		<table class="table table-sm table-srtiped">
		<tr>
			<th>User ID</th>
			<th>Name</th>
			<th>is admin</th>
			<th>is DJ</th>
		</tr>
		`;

		for(var i=0 ; i<self._user_list.length ; i++){
			var u = self._user_list[i];
			h += `
			<tr>
				<td>${u.user_id}</td>
				<td>${u.name}</td>
				<td>${u.is_admin}</td>
				<td>${u.is_dj}</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_cms_user_list').html(h);
	};
}