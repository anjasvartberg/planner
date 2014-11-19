var Planner = {};
Planner.Calendar = {};
Planner.Data = require(process.cwd() + '/backend/sheets.js');

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

Planner.Calendar.readAllCalendarEntries = function(month, callback) {
	Planner.Data.loadData("calendar", 0, function(data) {
		callback({days: data});	
	});
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

exports.getCalendarDay = Planner.Calendar.getCalendarDay;
exports.getCalendarMonth = Planner.Calendar.getCalendarMonth;
exports.getCalendarWeek = Planner.Calendar.getCalendarWeek;
exports.updateDay = Planner.Calendar.updateDay;
exports.readAllCalendarEntries = Planner.Calendar.readAllCalendarEntries;
