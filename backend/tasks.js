var Planner = {};
Planner.Todo = {};

var ObjectId = require('mongodb').ObjectID;
Planner.Data = require(process.cwd() + '/backend/sheets.js');

/*
Planner.Todo.writeTask = function(id, description, priority, responsible, recurrence, callback) {
	var task = {};
	task._id = id;

	Planner.Data.saveData("tasks", task, callback);
}
*/

Planner.Todo.updateTaskDone = function (id, done, callback) {
	var task = {};
	task._id = new ObjectId(id);
	task.done = done;
	Planner.Data.saveData("tasks", task, callback);
}

Planner.Todo.readAllTaskEntries = function(callback) {
	Planner.Data.loadData("tasks", 0, function(data) {
		callback({tasks: data});	
	});
}


Planner.Todo.readTaskEntries = function(priority, callback) {
	var query = 0;
	if (priority != undefined) {
		query = {"priority": priority};
	}
	console.log(query);
	Planner.Data.loadData("tasks", query, function(data) {
		callback({tasks: data});	
	});
}

Planner.Todo.readRecurringTaskEntries = function(recurrence, callback) {
	var query = 0;
	if (recurrence != undefined) {
		query = {"recurrence": recurrence};
	}
	console.log(query);
	Planner.Data.loadData("tasks", query, function(data) {
		callback({tasks: data});	
	});
}

exports.readAllTaskEntries = Planner.Todo.readAllTaskEntries;
exports.readTaskEntries = Planner.Todo.readTaskEntries;
exports.updateTaskDone = Planner.Todo.updateTaskDone;
exports.readRecurringTaskEntries = Planner.Todo.readRecurringTaskEntries;
