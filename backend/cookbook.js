Planner = {};
Planner.Cookbook = {};

var Spreadsheet = require('edit-google-spreadsheet');
Planner.Data = require(process.cwd() + '/backend/sheets.js');
Planner.Calendar = require(process.cwd() + '/backend/calendar.js');

var sessions = require(process.cwd() + '/backend/lib/session.js');


Planner.Cookbook.writeIngredient = function( data, callback) {
	Planner.Data.saveData("ingredients", data, callback);
}

Planner.Cookbook.writeRecipe = function(data, callback) {
	Planner.Data.saveData("recipes", data, callback);
}

Planner.Cookbook.readAllRecipes = function(callback) {
	Planner.Data.loadData("recipes", 0, callback);
}




Planner.Recipe = function(recipeData) {
	this.name = recipeData[1];
	this.ingredients = recipeData[2];
	this.recipe = recipeData[3];
}

Planner.Recipes = function() {
	this.recipes = new Array();
	this.length = 0;
	this.push = function(recipe) {
		this.recipes.push(recipe);
		this.length += 1;
	} 
}

Planner.ListItem = function(id, name, done) {
	this.id = id;
	this.name = name;
	this.quantity = quantity;
	this.done = done ? "checked" : "";
}

Planner.Groceries = function() {
	this.groceries = new Array();
	this.length = 0;
	this.push = function(listItem) {
		this.groceries.push(listItem);
	} 
}

Planner.Cookbook.getTodaysRecipe = function (session, callback) {
	Planner.Calendar.getToday(session, function(today) {
		var todaysRecipeName = today["restData"][1];
		console.log(todaysRecipeName);
		
		Planner.Data.getSpreadsheet(session, 'Oppskrifter', function(rows){
			for (key in rows){
				if (rows[key][1] == todaysRecipeName){
					var todaysRecipe = new Planner.Recipe(rows[key]);
					callback(todaysRecipe);
					return;
				}	
			}
		});
	});

}

Planner.Cookbook.getRecipes = function (session, callback) {
	Planner.Data.getSpreadsheet(session, 'Oppskrifter', function(rows){
		var recipes = new Planner.Recipes();
		for (key in rows){
			recipes.push(new Planner.Recipe(rows[key]));
		}
		callback(recipes);			
		
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

Planner.Cookbook.getGroceries = function (session, callback) {
	Planner.Data.getSpreadsheet(session, 'Groceries', function(rows){
		var groceries = new Planner.Groceries();
		for (key in rows){
			groceries.push(new Planner.ListItem(key, rows[key][1],rows[key][2]));
		}
		callback(groceries);
	});
}


exports.getTodaysRecipe = Planner.Cookbook.getTodaysRecipe;
exports.getRecipes = Planner.Cookbook.getRecipes;
exports.getGroceries = Planner.Cookbook.getGroceries;

exports.updateRecipe = Planner.Cookbook.updateRecipe;
exports.getRecipesDb = Planner.Cookbook.getRecipesDb;
