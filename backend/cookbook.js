Planner = {};
Planner.Cookbook = {};
Planner.Data = require(process.cwd() + '/backend/sheets.js');
Planner.Calendar = require(process.cwd() + '/backend/calendar.js');

Planner.Cookbook.writeIngredient = function( data, callback) {
	Planner.Data.saveData("ingredients", data, callback);
}

Planner.Cookbook.writeRecipe = function(data, callback) {
	var recipe = data;
	recipe._id = data.name;
	Planner.Data.saveData("recipes", recipe, callback);
}

Planner.Cookbook.deleteRecipe = function(data, callback) {
	var recipe = data;
	recipe._id = data.name;
	Planner.Data.deleteData("recipes", recipe, callback);
}

Planner.Cookbook.readAllRecipes = function(callback) {
	Planner.Data.loadData("recipes", 0, callback);
}

Planner.Cookbook.readRecipe = function(name, callback) {
	var query = {name : name};
	Planner.Data.loadData("recipes", query, callback);
}



Planner.Cookbook.getTodaysRecipe = function (callback) {
	var date = new Date();
	Planner.Calendar.getCalendarDay(date, function(today) {
		if (today.days != null && today.days[0] != undefined) {
			Planner.Cookbook.readRecipe(today.days[0].data.menu, function(recipe) {
                if (recipe != null) {
                	callback(recipe[0]);
                }
			});
		}
	});
}

Planner.Cookbook.updateRecipe = function (data, callback) {
	Planner.Cookbook.writeRecipe(data, callback);
	
}

Planner.Cookbook.getRecipesDb = function (callback) {
	Planner.Cookbook.readAllRecipes(function (data) {
		callback({recipes: data});
	});
	
}

exports.getTodaysRecipe = Planner.Cookbook.getTodaysRecipe;
exports.updateRecipe = Planner.Cookbook.updateRecipe;
exports.deleteRecipe = Planner.Cookbook.deleteRecipe;
exports.getRecipesDb = Planner.Cookbook.getRecipesDb;
