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

exports.readAllTaskEntries = Planner.Todo.readAllTaskEntries;
exports.updateTaskDone = Planner.Todo.updateTaskDone;
