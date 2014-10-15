var Planner = {};
Planner.Sheets = {};

var Spreadsheet = require('edit-google-spreadsheet');

Planner.Day = function(dayData, formatedDate, weekDay, columnNames) {
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

Planner.ComingWeek = function() {
	this.comingWeek = new Array();
	this.length = 0;
	this.push = function(day) {
		this.comingWeek.push(day);
		this.length += 1;
	} 
}

Planner.TodaysRecipe = function(recipeData) {
	this.name = recipeData[1];
	this.ingredients = recipeData[2];
	this.recipe = recipeData[3];
}

Planner.Task = function(id, taskData) {
	this.id = id;
	this.name = taskData[1];
	this.date = taskData[2];
	this.who = taskData[3];
	this.done = taskData[4] ? "checked" : "";
}

Planner.Tasks = function() {
	this.tasks = new Array();
	this.length = 0;
	this.push = function(task) {
		this.tasks.push(task);
		this.length += 1;
	} 
}


Planner.Sheets.getToday = function (callback) {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth();
	var weekDay = Planner.getWeekDayName(date.getDay());
	var year = date.getFullYear();
	var formatedDate = day + "." + (month+1) + "." + year;
	
	var worksheetName = Planner.getWorksheetName(month);
	Planner.Sheets.getSpreadsheet(worksheetName, function(rows){
		var columnNames = rows [1];
		var todayData = rows[day+1];
		var today = new Planner.Day(todayData,formatedDate,weekDay,columnNames);
		callback(today);
	});
}

Planner.Sheets.getComingWeek = function (callback) {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth();
	var year = date.getFullYear();
	
	var worksheetName = Planner.getWorksheetName(month);
	Planner.Sheets.getSpreadsheet(worksheetName, function(rows){
		var columnNames = rows [1];
		var week = new Planner.ComingWeek();
		for (var i = 1; i <= 7; i++) {
			var formatedDate = day+i + "." + (month+1) + "." + year;
			var weekDay = Planner.getWeekDayName((date.getDay()+i));
			var dayData = rows[day+i+1];
			week.push(new Planner.Day(dayData,formatedDate, weekDay, columnNames));		
		}
		callback(week);
	});
}

Planner.Sheets.getTodaysRecipe = function (callback) {
	Planner.Sheets.getToday(function(today) {
		var todaysRecipeName = today["menuOfTheDay"];
		Planner.Sheets.getSpreadsheet('Oppskrifter', function(rows){
			for (key in rows){
				if (rows[key][1] == todaysRecipeName){
					var todaysRecipe = new Planner.TodaysRecipe(rows[key]);
					callback(todaysRecipe);
					return;
				}	
			}
		});
	});

}

Planner.Sheets.getPlannedTasks = function (callback) {
	Planner.Sheets.getSpreadsheet('Planned tasks', function(rows){
		var tasks = new Planner.Tasks();
		for (key in rows){
			tasks.push(new Planner.Task(key, rows[key]));
		}
		callback(tasks);
	});

}

Planner.Sheets.setCompletedTask = function (task, callback) {
	var updateJson = {};
	if (!isNaN(task)) {
		updateJson[task] = { 4: 'x' };
		
		Planner.Sheets.updateSpreadsheet('Planned tasks', updateJson, function(rows){
			callback(updateJson);
		});
	} else {
		callback("failed");
	}
}


Planner.Sheets.getSpreadsheet = function(worksheetName, callback) {
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

Planner.Sheets.updateSpreadsheet = function(worksheetName, updateJson, callback) {
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

	    spreadsheet.add(updateJson);
	    spreadsheet.send(function(err) {
	    	if(err) throw err;
	      	
	      	callback(updateJson);
	    });
	    
	});
}
Planner.getWorksheetName = function(month) {
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


Planner.getWeekDayName = function(weekDay) {
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
exports.getToday = Planner.Sheets.getToday;
exports.getComingWeek = Planner.Sheets.getComingWeek;
exports.getTodaysRecipe = Planner.Sheets.getTodaysRecipe;
exports.getPlannedTasks = Planner.Sheets.getPlannedTasks;
exports.setCompletedTask = Planner.Sheets.setCompletedTask;
