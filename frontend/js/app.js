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
    var view = new Planner.Recipe.RecipeView({recipe: todaysRecipe, el: el});
    
    var plannedTasks = new Planner.Tasks();
    var el = $("#tasks");
    var view = new Planner.Tasks.TasksView({tasks: plannedTasks, el: el});

    day.fetch();
    week.fetch();
    todaysRecipe.fetch();
    plannedTasks.fetch();
    
    
  }

  Planner.startGroceries = function() {
    var groceries = new Planner.Groceries();
    var el = $("#groceries");
    var view = new Planner.Groceries.GroceriesView({groceries: groceries, el: el});    
    groceries.fetch();
  }
 
  Planner.Tasks = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/tasks";
    }
  });

  Planner.Tasks.TasksView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">Planlagte oppgaver</h3></div>' + 
                '<ul>' +
                  '{{#tasks}}' +
                    '<li><label class="checkbox"><input type="checkbox" value="{{id}}" {{done}}>{{name}}</label></li>' +
                  '{{/tasks}}' +
                '</ul>' +
              '</div>',
    initialize: function(options) {
      this.tasks = options.tasks;
      this.tasks.on("fetch:finished", this.render, this);
      this.el = options.el;
      var saveTask = new Planner.Tasks.SaveTask();  
      this.el.on("click", "label.checkbox", function(event) {
        var task = $(this).find("input").attr("value");
        saveTask.saveTask(task);
      
        //saveTask.on("fetch:finished", function() {window.location.reload()}, this);
      });

    },
    render: function() {
      var tasksAttrs = this.tasks.attrs();
      var html = Mustache.to_html(this.template, tasksAttrs);
      this.el.html(html);
    }
  }); 
  
  Planner.Tasks.SaveTask = Simple.Model.extend({
    dataType: "json",
    initialize: function() {},
    saveTask: function(task) {
        this.url = "/completeTask?task=" + task;  
        this.fetch();
    }
  });

  Planner.Groceries = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/groceries";
    }
  });

  Planner.Groceries.GroceriesView = Simple.View.extend({
    template: '<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">Handleliste</h3></div>' + 
                '<ul>' +
                  '{{#groceries}}' +
                    '<li><label class="checkbox"><input type="checkbox" value="{{id}}" {{done}}>{{name}}</label></li>' +
                  '{{/groceries}}' +
                '</ul>' +
              '</div>',
    initialize: function(options) {
      this.groceries = options.groceries;
      this.groceries.on("fetch:finished", this.render, this);
       
    },
    render: function() {
      var groceriesAttrs = this.groceries.attrs();
      var html = Mustache.to_html(this.template, groceriesAttrs);
      this.el.html(html);
    }
  });


})(Simple, Mustache);