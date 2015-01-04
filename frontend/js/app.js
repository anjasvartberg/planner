(function(Simple, Mustache) {

  window.Planner = window.Planner || {};

  Planner.start = function() {
    var day = new Planner.Day();
    var el = $("#day");
    var view = new Planner.Day.DayView({date: new Date(), day: day, el: el});
    
    var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var week = new Planner.Week(tomorrow);
    var el = $("#week");
    var view = new Planner.Week.WeekView({week: week, el: el});
    
    var todaysRecipe = new Planner.Recipe();
    var el = $("#recipe");
    var view = new Planner.Recipe.RecipeView({recipe: todaysRecipe, el: el, editMode: false});
    
    var plannedTasks = new Planner.Tasks({priority: 1});
    var el = $("#tasks");
    var view = new Planner.Tasks.TasksView({tasks: plannedTasks, el: el, panelTitle: "Prioriterte oppgaver"});

    day.fetch();
    week.fetch();
    todaysRecipe.fetch();
    plannedTasks.fetch(); 
  }


})(Simple, Mustache);