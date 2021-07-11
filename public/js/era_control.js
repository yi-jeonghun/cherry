function EraControl(){
	var self = this;
	this._year_list = [];

	this.Init = function(){
		self.InitHandle();
		self.GetYearList();

		return self;
	};

	this.InitHandle = function(){
	};

	//-----------------------------------------------------------------
	
	this.GoToYear = function(era_uid, year, region){
		window._router.Go(`/${window._country_code}/era_chart.go?eid=${era_uid}&year=${year}&region=${region}`);
	};

	//-----------------------------------------------------------------

	this.GetYearList = function(){
		var req = {
			country_code: window._country_code
		};
		POST('/cherry_api/era/get_year_list', req, res=>{
			if(res.ok){
				self._year_list = res.year_list;
				self.DISP_YearList();
			}else{
				alert(res.err);
			}
		});
	};


	//-----------------------------------------------------------------

	this.DISP_YearList = function(){
		{
			var h = '';
			for(var i=0 ; i<self._year_list.length ; i++){
				var y = self._year_list[i];
				if(y.region == 'domestic'){
					var onClick = `window._era_control.GoToYear('${y.era_uid}', '${y.year}', 'domestic')`;
					h += `
						<div class="text-center pointer border py-2" onClick="${onClick}">
							<i class="fas fa-music"></i>
							<span style="cursor:pointer">${y.year}</span>
						</div>
					`;
				}
			}
			$('#id_div_era_domestic_years').html(h);
		}

		{
			var h = '';
			for(var i=0 ; i<self._year_list.length ; i++){
				var y = self._year_list[i];
				if(y.region == 'foreign'){
					var onClick = `window._era_control.GoToYear('${y.era_uid}', '${y.year}', 'foreign')`;
					h += `
						<div class="text-center pointer border py-2" onClick="${onClick}">
							<i class="fas fa-music"></i>
							<span style="cursor:pointer">${y.year}</span>
						</div>
					`;
				}
			}
			$('#id_div_era_foreign_years').html(h);
		}
	};

}