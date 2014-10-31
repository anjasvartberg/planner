var Planner = {};
Planner.Sheets = {};

var Spreadsheet = require('edit-google-spreadsheet');

var sessions = require(process.cwd() + '/backend/lib/session.js');

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
    var months = {0: "January", 1: "February", 2: "March", 3: "April", 4: "May", 5: "June", 6: "July", 7: "August", 8: "September", 9: "October", 10: "November", 11: "December"};
    return months[month];
}

Planner.getWeekDayName = function(weekDay) {
    var weekdays = {1: "Mandag", 2: "Tirsdag", 3: "Onsdag", 4: "Torsdag", 5: "Fredag", 6: "Lørdag", 0: "Søndag"};
    return weekdays[weekDay%7];
}
exports.getSpreadsheet = Planner.Sheets.getSpreadsheet;
exports.updateSpreadsheet = Planner.Sheets.updateSpreadsheet;
exports.getWorksheetName = Planner.getWorksheetName;
exports.getWeekDayName = Planner.getWeekDayName;
