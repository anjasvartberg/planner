var Planner = {};
Planner.Todo = {};

var Spreadsheet = require('edit-google-spreadsheet');
Planner.Sheets = require(process.cwd() + '/backend/sheets.js');

var sessions = require(process.cwd() + '/backend/lib/session.js');


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

Planner.Todo.getPlannedTasks = function (session, callback) {
	Planner.Sheets.getSpreadsheet(session, 'Planned tasks', function(rows){
		var tasks = new Planner.Tasks();
		for (key in rows){
			tasks.push(new Planner.Task(key, rows[key]));
		}
		callback(tasks);
	});

}

Planner.Todo.setCompletedTask = function (session, task, callback) {
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


exports.getPlannedTasks = Planner.Todo.getPlannedTasks;
exports.setCompletedTask = Planner.Todo.setCompletedTask;
