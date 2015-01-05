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

//Database

try {
	var databaseUrl = process.env.MONGOLAB_URI || "localhost:27017/planner";
	var collections = ["ingredients", "recipes", "calendar", "tasks"]
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
	db[type].find({_id: data._id}, function(err, foundData) {
		if (err) throw err;
		
		if (foundData.length == 0) {
			db[type].save(data, Planner.Data.saveUpdateCallback);
		} else {
			db[type].update({_id: data._id}, {$set: data}, Planner.Data.saveUpdateCallback);
		}
		callback({result: "success"});
	});
}
	
Planner.Data.deleteData = function(type, data, callback) {
	db[type].remove({_id: data._id}, function(err, removedData) {
		if (err) throw err;
		
		if (removedData.length == 0) {
			callback({result: "no data removed"});
		} else {
            callback({result: "success"});
		}
	});
}

Planner.Data.loadData = function(type, query, callback) {
	if (callback == undefined) {
		console.log("ERROR: No callback defined");
		return;
	}

	if (query == 0) {
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
		db[type].find(query, function(err, data) {
			if (err) throw err;
			
			if (data.length == 0) {
				console.log("No data found");
				callback(null)
			} else {
				console.log("Found data: " + data);
				callback(data)
			}
		});
	}
	
}


/*exports.getSpreadsheet = Planner.Data.getSpreadsheet;
exports.updateSpreadsheet = Planner.Data.updateSpreadsheet;
exports.getWorksheetName = Planner.Data.getWorksheetName;
*/
exports.saveData = Planner.Data.saveData;
exports.deleteData = Planner.Data.deleteData;
exports.loadData = Planner.Data.loadData;
