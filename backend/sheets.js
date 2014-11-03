var Planner = {};
Planner.Data = {};

var Spreadsheet = require('edit-google-spreadsheet');

var sessions = require(process.cwd() + '/backend/lib/session.js');

Planner.Data.getSpreadsheet = function(session, worksheetName, callback) {
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

Planner.Data.updateSpreadsheet = function(session, worksheetName, updateJson, callback) {
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
Planner.Data.getWorksheetName = function(month) {
    var months = {0: "January", 1: "February", 2: "March", 3: "April", 4: "May", 5: "June", 6: "July", 7: "August", 8: "September", 9: "October", 10: "November", 11: "December"};
    return months[month];
}

Planner.Data.getWeekDayName = function(weekDay) {
    var weekdays = {1: "Mandag", 2: "Tirsdag", 3: "Onsdag", 4: "Torsdag", 5: "Fredag", 6: "Lørdag", 0: "Søndag"};
    return weekdays[weekDay%7];
}

//Database

try {
	var databaseUrl = process.env.MONGOLAB_URI || "localhost:27017/planner";
	var collections = ["ingredients", "recipes"]
	var db = require("mongojs").connect(databaseUrl, collections);
} catch (err) {
	console.log("FAILED TO CONNECT TO DATABASE: " + err);
}


Planner.Data.saveUpdateCallback = function(err, saved) {
	if (err) throw err;
	
	if (!saved) {
		console.log("No data saved/updated");
	} else { 
		console.log("Data saved/updated");
	}
}
	
Planner.Data.saveData = function(type, data, callback) {
	console.log("saving data: " + data);
	db[type].find({_id: data._id}, function(err, foundData) {
		if (err) throw err;
		
		if (foundData.length == 0) {
			db[type].save(data, Planner.Db.saveUpdateCallback);
		} else {
			db[type].update({_id: data._id}, data, Planner.Db.saveUpdateCallback);
		}
		callback({result: "success"});
	});
}

Planner.Data.loadData = function(type, id, callback) {
	if (callback == undefined) {
		console.log("ERROR: No callback defined");
		return;
	}

	if (id == 0) {
		db[type].find(function(err, data) {
			if (err) throw err;
			
			if (data.length == 0) {
				console.log("No data found");
				callback(null)
			} else {
				console.log("Found data: " + data);
				callback(data)
			}
		});	
	} else {
		db[type].find({_id: id}, function(err, data) {
			if (err) throw err;
			
			if (data.length == 0) {
				console.log("No data found");
				callback(null)
			} else {
				console.log("Found data: " + data[0]);
				callback(data[0])
			}
		});
	}
	
}


exports.getSpreadsheet = Planner.Data.getSpreadsheet;
exports.updateSpreadsheet = Planner.Data.updateSpreadsheet;
exports.getWorksheetName = Planner.Data.getWorksheetName;
exports.getWeekDayName = Planner.Data.getWeekDayName;

exports.saveData = Planner.Data.saveData;
exports.loadData = Planner.Data.loadData;
