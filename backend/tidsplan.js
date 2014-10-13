var Tidsplan = {};
Tidsplan.Sheets = {};

var Spreadsheet = require('edit-google-spreadsheet');

Tidsplan.Day = function(dayData, formatedDate, weekDay, columnNames) {
	this.date = formatedDate;
	this.weekDay = weekDay;
	this.plans = dayData[2];
	this.menuOfTheDay = dayData[3];
	this.restData = new Array();
	this.columnNames = new Array();
	for (var i = 4; i <= Object.keys(columnNames).length; i ++) {
		this.columnNames.push(columnNames[i]);
		this.restData.push(dayData[i]);
	}

}

Tidsplan.ComingWeek = function() {
	this.comingWeek = new Array();
	this.length = 0;
	this.push = function(day) {
		this.comingWeek.push(day);
		this.length += 1;
	} 
}

Tidsplan.TodaysRecipe = function(recipeData) {
	this.name = recipeData[1];
	this.ingredients = recipeData[2];
	this.recipe = recipeData[3];
}

Tidsplan.Task = function(taskData) {
	this.name = taskData[1];
	this.date = taskData[2];
	this.who = taskData[3];
	this.done = taskData[4];
}

Tidsplan.Tasks = function() {
	this.tasks = new Array();
	this.length = 0;
	this.push = function(task) {
		this.tasks.push(task);
		this.length += 1;
	} 
}

Tidsplan.Sheets.getToday = function (callback) {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth();
	var weekDay = Tidsplan.getWeekDayName(date.getDay());
	var year = date.getFullYear();
	var formatedDate = day + "." + (month+1) + "." + year;
	
	var worksheetName = Tidsplan.getWorksheetName(month);
	Tidsplan.Sheets.getSpreadsheet(worksheetName, function(rows){
		var columnNames = rows [1];
		var todayData = rows[day+1];
		var today = new Tidsplan.Day(todayData,formatedDate,weekDay,columnNames);
		callback(today);
	});
}

Tidsplan.Sheets.getComingWeek = function (callback) {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth();
	var year = date.getFullYear();
	
	var worksheetName = Tidsplan.getWorksheetName(month);
	Tidsplan.Sheets.getSpreadsheet(worksheetName, function(rows){
		var columnNames = rows [1];
		var week = new Tidsplan.ComingWeek();
		for (var i = 1; i <= 7; i++) {
			var formatedDate = day+i + "." + (month+1) + "." + year;
			var weekDay = Tidsplan.getWeekDayName((date.getDay()+i));
			var dayData = rows[day+i+1];
			week.push(new Tidsplan.Day(dayData,formatedDate, weekDay, columnNames));		
		}
		callback(week);
	});
}

Tidsplan.Sheets.getTodaysRecipe = function (callback) {
	Tidsplan.Sheets.getToday(function(today) {
		var todaysRecipeName = today["menuOfTheDay"];
		Tidsplan.Sheets.getSpreadsheet('Oppskrifter', function(rows){
			for (key in rows){
				if (rows[key][1] == todaysRecipeName){
					var todaysRecipe = new Tidsplan.TodaysRecipe(rows[key]);
					callback(todaysRecipe);
					return;
				}	
			}
		});
	});

}

Tidsplan.Sheets.getPlannedTasks = function (callback) {
	Tidsplan.Sheets.getSpreadsheet('Planned tasks', function(rows){
		var tasks = new Tidsplan.Tasks();
		for (key in rows){
			tasks.push(new Tidsplan.Task(rows[key]));
		}
		callback(tasks);
	});

}


Tidsplan.Sheets.getSpreadsheet = function(worksheetName, callback) {
  	Spreadsheet.load({
	    debug: true,
	    spreadsheetId: 'tYzNgvoJTO5K04u5e3Jz7iA',
	    worksheetName: worksheetName,
	    oauth : {
	      email: '325419649433-9pm086ik6gvbvpcle5vrhdvl896acg9v@developer.gserviceaccount.com',
	      key: process.env.PEM_KEY
	    }

  	}, function sheetReady(err, spreadsheet) {
		if(err) throw err;

	    spreadsheet.receive(function(err, rows, info) {
	          if(err) throw err;
	          callback(rows);
	    });
	});
}

Tidsplan.getWorksheetName = function(month) {
	var worksheet = '';
	switch (month) {
	    case 0:
	        worksheet = "ocy"; //Denne uka
	        break;
	    case 1:
	        worksheet = "ocy";
	        break;
	    case 2:
	        worksheet = "ocy";
	        break;
	    case 3:
	        worksheet = "ocy";
	        break;
	    case 4:
	        worksheet = "ocy";
	        break;
	    case 5:
	        worksheet = "ocy";
	        break;
	    case 6:
	        worksheet = "ocy";
	        break;
	    case 7:
	        worksheet = "ocy";
	        break;
	    case 8:
	        worksheet = "ocy";
	        break;
	    case 9:
	        worksheet = "October"; //Oktober
	        break;
	    case 10:
	        worksheet = "ocy";
	        break;
	    case 11:
	        worksheet = "ocy";
	        break;
	}
	return worksheet;

}


Tidsplan.getWeekDayName = function(weekDay) {
	var weekDayName = '';
	switch (weekDay%7) {
	    case 1:
	        weekDayName = "Mandag";
	        break;
	    case 2:
	        weekDayName = "Tirsdag";
	        break;
	    case 3:
	        weekDayName = "Onsdag";
	        break;
	    case 4:
	        weekDayName = "Torsdag";
	        break;
	    case 5:
	        weekDayName = "Fredag";
	        break;
	    case 6:
	        weekDayName = "Lørdag";
	        break;
	    case 0:
	        weekDayName = "Søndag";
	        break;
	}
	return weekDayName;

}
exports.getToday = Tidsplan.Sheets.getToday;
exports.getComingWeek = Tidsplan.Sheets.getComingWeek;
exports.getTodaysRecipe = Tidsplan.Sheets.getTodaysRecipe;
exports.getPlannedTasks = Tidsplan.Sheets.getPlannedTasks;
