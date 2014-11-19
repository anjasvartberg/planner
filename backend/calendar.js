var Planner = {};
Planner.Calendar = {};

var Spreadsheet = require('edit-google-spreadsheet');
Planner.Data = require(process.cwd() + '/backend/sheets.js');

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

Planner.Calendar.getCalendarDay = function (date, callback) {
	var startDate = new Date(date);
	var dayOfMonth = startDate.getDate();
	startDate.setDate(dayOfMonth - 1);
	
	var endDate = new Date(date);
	var dayOfMonth = endDate.getDate();
	endDate.setDate(dayOfMonth + 1);
	
	var query = {"_id": {$gte: startDate, $lt: endDate}};
	
	Planner.Data.loadData("calendar", query, function(data) {
		callback({days: data});	
	});
}

Planner.Calendar.readAllCalendarEntries = function(month, callback) {
	Planner.Data.loadData("calendar", 0, function(data) {
		callback({days: data});	
	});
}

Planner.Calendar.getCalendarWeek = function(date, callback) {
	var startDate = new Date(date);
	var dayOfMonth = startDate.getDate();
	startDate.setDate(dayOfMonth - 1);
	
	var endDate = new Date(date);
	var dayOfMonth = endDate.getDate();
	endDate.setDate(dayOfMonth + 8);
	
	var query = {"_id": {$gte: startDate, $lt: endDate}};
	Planner.Data.loadData("calendar", query, function(data) {
		callback({days: data});	
	});
}


Planner.Calendar.getCalendarMonth = function(month, callback) {
	var query = {"month": month};
	Planner.Data.loadData("calendar", query, function(data) {
		callback({days: data});	
	});
}


Planner.Calendar.writeDay = function(day, month, year, data, callback) {
	var date = {};
	date._id = new Date(year, month, day);
	date.day = day;
	date.month = month;
	date.year = year;
	date.data = data;
	Planner.Data.saveData("calendar", date, callback);
}

Planner.Calendar.updateDay = function (day, month, postData, callback) {
	var updateJson = {};
	if (!isNaN(day)) {
		Planner.Calendar.writeDay(day, month, 2014, postData, callback);
	} else {
		callback("failed");
	}
}

Planner.Calendar.getWeek = function (startDate, session, callback) {
	var startDate = new Date(startDate);
	var day = startDate.getDate();
	var month = startDate.getMonth();
	var year = startDate.getFullYear();

	var spreadsheeetName = Planner.Data.getWorksheetName(month);
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
		var weekDay = Planner.Data.getWeekDayName((dayDate.getDay()));
		var dayData = rows[i+1];
		if (dayData != undefined) {
			week.push(new Planner.Day(dayData,month,formatedDate, weekDay, rows[1]));		
		} else {
			daysLeft = day + 7 - i + 1;
			break;
		}
	}

	if (daysLeft > 0) {
		var spreadsheeetNameNextMonth = Planner.Data.getWorksheetName(month + 1);
		var nextMonth = Planner.Calendar.Month[spreadsheeetNameNextMonth];			
		for (var j = 1; j <= daysLeft; j++) {
			var formatedDate = j + "." + (month+2) + "." + year;
			var dayDate = new Date(year, month+1, j);
			var weekDay = Planner.Data.getWeekDayName((dayDate.getDay()));
			var dayData = nextMonth[j+1];
			if (dayData != undefined) {
				week.push(new Planner.Day(dayData,month,formatedDate, weekDay, nextMonth[1]));		
			}
		}
	}


	callback(week);
}

exports.getCalendarDay = Planner.Calendar.getCalendarDay;
exports.getWeek = Planner.Calendar.getWeek;
exports.getCalendarMonth = Planner.Calendar.getCalendarMonth;
exports.getCalendarWeek = Planner.Calendar.getCalendarWeek;
exports.updateDay = Planner.Calendar.updateDay;
exports.readAllCalendarEntries = Planner.Calendar.readAllCalendarEntries;
