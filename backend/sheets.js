var Planner = {};
Planner.Sheets = {};

var Spreadsheet = require('edit-google-spreadsheet');

var sessions = require(process.cwd() + '/backend/lib/session.js');

Planner.Day = function(dayData, formatedDate, weekDay, columnNames) {
	this.id = dayData[1];
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

Planner.DaySimple = function(dayData, formatedDate, weekDay) {
	this.date = formatedDate;
	this.weekDay = weekDay;
	this.restData = new Array();
	for (var i = 2; i <= Object.keys(dayData).length; i ++) {
		this.restData.push(dayData[i]);
	}

}

Planner.Days = function(name) {
	this.name = name;
	this.days = new Array();
	this.length = 0;
	this.push = function(day) {
		this.days.push(day);
		this.length += 1;
	} 
}

Planner.Recipe = function(recipeData) {
	this.name = recipeData[1];
	this.ingredients = recipeData[2];
	this.recipe = recipeData[3];
}

Planner.Recipes = function() {
	this.recipes = new Array();
	this.length = 0;
	this.push = function(recipe) {
		this.recipes.push(recipe);
		this.length += 1;
	} 
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

Planner.Sheets.getToday = function (session, callback) {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth();
	var weekDay = Planner.getWeekDayName(date.getDay());
	var year = date.getFullYear();
	var formatedDate = day + "." + (month+1) + "." + year;
	
	var worksheetName = Planner.getWorksheetName(month);
	Planner.Sheets.getSpreadsheet(session, worksheetName, function(rows){
		var columnNames = rows [1];
		var todayData = rows[day+1];
		var today = new Planner.Day(todayData,formatedDate,weekDay,columnNames);
		callback(today);
	});
}

Planner.Sheets.updateDay = function (session, day, month, postData, callback) {
	var updateJson = {};
	if (!isNaN(day)) {
		console.log(postData);
		updateJson[day+1] = postData;
		
		Planner.Sheets.updateSpreadsheet(session, month, updateJson, function(rows){
			callback(updateJson);
		});
	} else {
		callback("failed");
	}
}

Planner.Sheets.getComingWeek = function (session, callback) {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth();
	var year = date.getFullYear();

	var spreadsheeetName = Planner.getWorksheetName(month);
	var rows = Planner.Sheets.Month[spreadsheeetName];
	var columnNames = new Array();
	for (var i in rows[1]) {
		columnNames.push(rows[1][i]);
	}
	var week = new Planner.Days(columnNames,"Denne uka");
	for (var i = day + 1; i <= day + 7; i++) {
		var formatedDate = i + "." + (month+1) + "." + year;
		var dayDate = new Date(year, month, i);
		var weekDay = Planner.getWeekDayName((dayDate.getDay()));
		var dayData = rows[i+1];
		if (dayData != undefined) {
			week.push(new Planner.Day(dayData,formatedDate, weekDay, rows[1]));		
		} else {
			//var spreadsheeetNameNextMonth = Planner.getWorksheetName(month + 1);
			//var nextMonth = Planner.Sheets.Month[spreadsheeetNameNextMonth];	
			

		}
	}
	callback(week);


	/*Planner.Sheets.getSpreadsheet(spreadsheeetName, function(rows){
		
	});*/
}

Planner.Sheets.setupMonths = function (session) {
	Planner.Sheets.Month = new Array();
	Planner.Sheets.getSpreadsheet(session, "January", function(rows){
		Planner.Sheets.Month["January"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "February", function(rows){
		Planner.Sheets.Month["February"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "March", function(rows){
		Planner.Sheets.Month["March"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "April", function(rows){
		Planner.Sheets.Month["April"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "May", function(rows){
		Planner.Sheets.Month["May"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "June", function(rows){
		Planner.Sheets.Month["June"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "July", function(rows){
		Planner.Sheets.Month["July"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "August", function(rows){
		Planner.Sheets.Month["August"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "September", function(rows){
		Planner.Sheets.Month["September"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "October", function(rows){
		Planner.Sheets.Month["October"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "November", function(rows){
		Planner.Sheets.Month["November"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "December", function(rows){
		Planner.Sheets.Month["December"] = rows;
	});
}

Planner.Sheets.getTodaysRecipe = function (session, callback) {
	Planner.Sheets.getToday(session, function(today) {
		var todaysRecipeName = today["menuOfTheDay"];
		Planner.Sheets.getSpreadsheet(session, 'Oppskrifter', function(rows){
			for (key in rows){
				if (rows[key][1] == todaysRecipeName){
					var todaysRecipe = new Planner.Recipe(rows[key]);
					callback(todaysRecipe);
					return;
				}	
			}
		});
	});

}

Planner.Sheets.getRecipes = function (session, callback) {
	Planner.Sheets.getSpreadsheet(session, 'Oppskrifter', function(rows){
		var recipes = new Planner.Recipes();
		for (key in rows){
			recipes.push(new Planner.Recipe(rows[key]));
		}
		callback(recipes);			
		
	});
}

Planner.Sheets.getPlannedTasks = function (session, callback) {
	Planner.Sheets.getSpreadsheet(session, 'Planned tasks', function(rows){
		var tasks = new Planner.Tasks();
		for (key in rows){
			tasks.push(new Planner.Task(key, rows[key]));
		}
		callback(tasks);
	});

}

Planner.Sheets.setCompletedTask = function (session, task, callback) {
	var updateJson = {};
	if (!isNaN(task)) {
		updateJson[task] = { 4: 'x' };
		
		Planner.Sheets.updateSpreadsheet(session, 'Planned tasks', updateJson, function(rows){
			callback(updateJson);
		});
	} else {
		callback("failed");
	}
}

Planner.Sheets.getCalendar = function (session, month, callback) {
	var date = new Date();
	var year = date.getFullYear();

	var worksheetName = Planner.getWorksheetName(month);
	
	var monthData = new Planner.Days(worksheetName);

	Planner.Sheets.getSpreadsheet(session, worksheetName, function(rows){
		var columnNames = new Array();
		for (row in rows[1]) {
			columnNames.push(rows[1][row]);
		}

		monthData.columnNames = columnNames;
		
		for (var i = 2; i <= Object.keys(rows).length; i++) {
			var dayDate = new Date(year, month, rows[i][1]);
			var formatedDate = rows[i][1] + "." + (month+1) + "." + year;
			var weekDay = Planner.getWeekDayName((dayDate.getDay()));
			var dayData = rows[i];
			monthData.push(new Planner.Day(dayData, formatedDate, weekDay, rows[1]));		
		}
		callback(monthData);	
	});
}

Planner.Sheets.getSpreadsheet = function(session, worksheetName, callback) {
  	Spreadsheet.load({
	    debug: true,
	    spreadsheetId: 'tYzNgvoJTO5K04u5e3Jz7iA',
	    worksheetName: worksheetName,
		accessToken : {
			type: 'Bearer',
			token: session.data.accessToken
		}
  	}, function sheetReady(err, spreadsheet) {
		if(err) throw new Error(err);

	    spreadsheet.receive(function(err, rows, info) {
			if(err) throw new Error(err);
	        callback(rows);
	    });
	});
}

Planner.Sheets.updateSpreadsheet = function(session, worksheetName, updateJson, callback) {
  	var session = sessions.lookupOrCreate(request);
	
	Spreadsheet.load({
	    debug: true,
	    spreadsheetId: 'tYzNgvoJTO5K04u5e3Jz7iA',
	    worksheetName: worksheetName,
		accessToken : {
			type: 'Bearer',
			token: session.data.accessToken
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
	        worksheet = "January";
	        break;
	    case 1:
	        worksheet = "February";
	        break;
	    case 2:
	        worksheet = "March";
	        break;
	    case 3:
	        worksheet = "April";
	        break;
	    case 4:
	        worksheet = "May";
	        break;
	    case 5:
	        worksheet = "June";
	        break;
	    case 6:
	        worksheet = "July";
	        break;
	    case 7:
	        worksheet = "August";
	        break;
	    case 8:
	        worksheet = "September";
	        break;
	    case 9:
	        worksheet = "October"; //Oktober
	        break;
	    case 10:
	        worksheet = "November";
	        break;
	    case 11:
	        worksheet = "December";
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
exports.getCalendar = Planner.Sheets.getCalendar;
exports.getRecipes = Planner.Sheets.getRecipes;
exports.setupMonths = Planner.Sheets.setupMonths;
exports.updateDay = Planner.Sheets.updateDay;
