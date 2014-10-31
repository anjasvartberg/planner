var Planner = {};
Planner.Calendar = {};

var Spreadsheet = require('edit-google-spreadsheet');
Planner.Sheets = require(process.cwd() + '/backend/sheets.js');

var sessions = require(process.cwd() + '/backend/lib/session.js');

Planner.Day = function(dayData, month, formatedDate, weekDay, columnNames) {
	this.id = dayData[1];
	this.month = month;
	this.date = formatedDate;
	this.weekDay = weekDay;
	this.restData = new Array();
	this.columnNames = new Array();
	for (var i = 2; i <= Object.keys(columnNames).length; i ++) {
		this.columnNames.push(columnNames[i]);
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

Planner.Calendar.getToday = function (session, callback) {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth();
	var weekDay = Planner.Sheets.getWeekDayName(date.getDay());
	var year = date.getFullYear();
	var formatedDate = day + "." + (month+1) + "." + year;
	
	var worksheetName = Planner.Sheets.getWorksheetName(month);
	Planner.Sheets.getSpreadsheet(session, worksheetName, function(rows){
		var columnNames = rows [1];
		var todayData = rows[day+1];
		var today = new Planner.Day(todayData,month,formatedDate,weekDay,columnNames);
		callback(today);
	});
}

Planner.Calendar.updateDay = function (session, day, month, postData, callback) {
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

Planner.Calendar.getWeek = function (startDate, session, callback) {
	console.log(new Date());
	var startDate = new Date(startDate);
	var day = startDate.getDate();
	var month = startDate.getMonth();
	var year = startDate.getFullYear();

	var spreadsheeetName = Planner.Sheets.getWorksheetName(month);
	var rows = Planner.Calendar.Month[spreadsheeetName];
	var columnNames = new Array();
	for (var i in rows[1]) {
		columnNames.push(rows[1][i]);
	}
	var week = new Planner.Days(columnNames,"Denne uka");
	var daysLeft = 0;
	for (var i = day + 1; i <= day + 7; i++) {
		var formatedDate = i + "." + (month+1) + "." + year;
		var dayDate = new Date(year, month, i);
		var weekDay = Planner.Sheets.getWeekDayName((dayDate.getDay()));
		var dayData = rows[i+1];
		if (dayData != undefined) {
			week.push(new Planner.Day(dayData,month,formatedDate, weekDay, rows[1]));		
		} else {
			daysLeft = day + 7 - i + 1;
			break;
		}
	}

	if (daysLeft > 0) {
		var spreadsheeetNameNextMonth = Planner.Sheets.getWorksheetName(month + 1);
		var nextMonth = Planner.Calendar.Month[spreadsheeetNameNextMonth];			
		for (var j = 1; j <= daysLeft; j++) {
			var formatedDate = j + "." + (month+2) + "." + year;
			var dayDate = new Date(year, month+1, j);
			var weekDay = Planner.Sheets.getWeekDayName((dayDate.getDay()));
			var dayData = nextMonth[j+1];
			if (dayData != undefined) {
				week.push(new Planner.Day(dayData,month,formatedDate, weekDay, nextMonth[1]));		
			}
		}
	}


	callback(week);
}


Planner.Calendar.getCalendar = function (session, month, callback) {
	var date = new Date();
	var year = date.getFullYear();

	var worksheetName = Planner.Sheets.getWorksheetName(month);
	
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
			var weekDay = Planner.Sheets.getWeekDayName((dayDate.getDay()));
			var dayData = rows[i];
			monthData.push(new Planner.Day(dayData, month, formatedDate, weekDay, rows[1]));		
		}
		callback(monthData);	
	});
}

Planner.Calendar.setupMonths = function (session) {
	Planner.Calendar.Month = new Array();
	Planner.Sheets.getSpreadsheet(session, "January", function(rows){
		Planner.Calendar.Month["January"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "February", function(rows){
		Planner.Calendar.Month["February"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "March", function(rows){
		Planner.Calendar.Month["March"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "April", function(rows){
		Planner.Calendar.Month["April"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "May", function(rows){
		Planner.Calendar.Month["May"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "June", function(rows){
		Planner.Calendar.Month["June"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "July", function(rows){
		Planner.Calendar.Month["July"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "August", function(rows){
		Planner.Calendar.Month["August"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "September", function(rows){
		Planner.Calendar.Month["September"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "October", function(rows){
		Planner.Calendar.Month["October"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "November", function(rows){
		Planner.Calendar.Month["November"] = rows;
	});
	Planner.Sheets.getSpreadsheet(session, "December", function(rows){
		Planner.Calendar.Month["December"] = rows;
	});
}


exports.getToday = Planner.Calendar.getToday;
exports.getWeek = Planner.Calendar.getWeek;
exports.getCalendar = Planner.Calendar.getCalendar;
exports.setupMonths = Planner.Calendar.setupMonths;
exports.updateDay = Planner.Calendar.updateDay;
