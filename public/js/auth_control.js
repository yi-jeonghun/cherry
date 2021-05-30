$(document).ready(function () {
	window._auth_control = new AuthControl();
	_auth_control.Init();
});

function AuthControl(){
	var self = this;
	this._user_info = null;
	this._cb_on_login = null;
	this._cb_on_logout = null;
	this._cb_on_login_fail = null;

	this.Init = function(){
		self.ComponentHandle();
		self.UpdateUserInfo();
		self.GetUserInfoSession();
	};

	this.IsLogin = function(){
		// console.log('self._user_info ' + self._user_info);
		return self._user_info != null ? true : false;
	};

	this.GetUserID = function(){
		var user_id = null;
		if(self.IsLogin()){
			user_id = self._user_info.user_id;
		}
		return user_id;
	};

	this.ComponentHandle = function (){
		$('#id_btn_logout').on('click', self.OnClickLogout);
	};

	this.UpdateUserInfo = function(){
		$('#id_google_signin').hide();
		var ele_user_null = $('#id_user_info_null');
		var ele_user_not_null = $('#id_user_info_not_null');
		var ele_id_google_signin = $('#id_google_signin');
		if(self._user_info == null){
			ele_user_null.show();
			ele_id_google_signin.show();
			ele_user_not_null.hide();
		}else{
			ele_user_null.hide();
			ele_id_google_signin.hide();
			ele_user_not_null.show();

			$('#id_user_info_image').attr('src', self._user_info.image_url);
			$('#id_user_info_name').text(self._user_info.name);
		}
	};

	this.GetUserInfoSession = function(){
		$.ajax({
			url:'/auth_api/get_user_info_session',
			success:function(res){
				if(res.ok){
					console.log('login ok ' );
					self._user_info = res.user_info;
					self.UpdateUserInfo();
					if(self._cb_on_login){
						self._cb_on_login();
					}
				}else{
					console.log('not logged in');
					if(self._cb_on_login_fail){
						self._cb_on_login_fail();
					}
				}
			}
		});
	};

	this.OnGoogleSignIn = function(googleUser, cb){
		console.log('OnGoogleSignIn');
		//console.log('googleUser.getAuthResponse().id_token ' + googleUser.getAuthResponse().id_token);
		var user_info = {
			token:googleUser.getAuthResponse().id_token
		};
		$.ajax({
			url:'/auth_api/login',
			type:'POST',
			data:JSON.stringify(user_info),
			contentType:"application/json; charset=utf-8",
			dataType:"json",
			success:function(result){
				if(result.ok){
					console.log('login ok');
					self._user_info = result.user_info;
					self.UpdateUserInfo();
					cb(true);
					if(self._cb_on_login){
						self._cb_on_login();
					}
				}else{
					cb(false);
				}
			}
		});
	};

	this.OnClickLogout = function(){
		$.ajax({
			url:'/auth_api/logout',
			success:function(res){
				if(res.ok){
					var auth2 = gapi.auth2.getAuthInstance();
					auth2.signOut().then(function () {
						console.log('User signed out.');
						auth2.disconnect();
						self._user_info = null;
						self.UpdateUserInfo();
						if(self._cb_on_logout){
							self._cb_on_logout();
						}
					});
				}
			}
		});
	};
}