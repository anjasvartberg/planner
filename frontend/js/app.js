(function(Simple, Mustache) {

  window.Tidsplan = window.Tidsplan || {};

  Tidsplan.start = function() {
    var day = new Tidsplan.Day();
    var el = $("#day");
    var view = new Tidsplan.Day.DayView({day: day, el: el});
    
    var week = new Tidsplan.Week();
    var el = $("#week");
    var view = new Tidsplan.Week.WeekView({week: week, el: el});
    
    var todaysRecipe = new Tidsplan.Recipe();
    var el = $("#recipe");
    var view = new Tidsplan.Recipe.RecipeView({recipe: todaysRecipe, el: el});
    
    var plannedTasks = new Tidsplan.Tasks();
    var el = $("#tasks");
    var view = new Tidsplan.Tasks.TasksView({tasks: plannedTasks, el: el});
    

	  day.fetch();
    week.fetch();
    todaysRecipe.fetch();
    plannedTasks.fetch();
  }

  Tidsplan.Day = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/day";
    }
  });

  Tidsplan.Week = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/week";
    }
  });

  Tidsplan.Recipe = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/recipe";
    }
  });

  Tidsplan.Tasks = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/tasks";
    }
  });

  Tidsplan.Day.DayView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
            '<div class="panel-heading"><h3 class="panel-title"> {{weekDay}} {{date}} </h3></div>' +
              '<div class="panel-body">' +
                '{{plans}}' +
              '</div>' +
              '<ul class="list-group">' + 
                '{{#restCols}}' + 
                '<li class="list-group-item">{{{.}}}</li>' +
                '{{/restCols}}' +
              '</ul></div>',
    initialize: function(options) {
      this.day = options.day;
      this.day.on("fetch:finished", this.render, this);
      this.el = options.el;
    
    },
    render: function() {
      var dayAttrs = this.day.attrs();
      dayAttrs.restCols = new Array();
      for (column in dayAttrs.columnNames) {
        if (dayAttrs.restData[column] != null) {  
          dayAttrs.restCols.push("<strong>" + dayAttrs.columnNames[column] + ":</strong> " + dayAttrs.restData[column]);
        }
      }
      var html = Mustache.to_html(this.template, dayAttrs);
      this.el.html(html);
    }
  });

  Tidsplan.Week.WeekView = Simple.View.extend({
    template:'<div class="page-header"><h1>Neste uke</h1></div>' +
      '{{#comingWeek}}' +
        '<div class="col-md-6">' +
          '<div class="panel panel-{{style}}">' +
            '<div class="panel-heading"><h3 class="panel-title">{{weekDay}} {{date}}</h3></div>' +
              '<ul class="list-group">' +
                '<li class="list-group-item">Dagens planer: {{plans}} </li>' +
                '<li class="list-group-item">Dagens middag: {{menuOfTheDay}}</li>' +
                '{{#restCols}}' + 
                '<li class="list-group-item">{{{.}}}</li>' +
                '{{/restCols}}' +
              '</ul></div></div>' +
      '{{/comingWeek}}',
    initialize: function(options) {
      this.week = options.week;
      this.week.on("fetch:finished", this.render, this);
      this.el = options.el;
    
    },
    render: function() {
      var weekAttrs = this.week.attrs();
        for (day in weekAttrs.comingWeek) {
          var day = weekAttrs.comingWeek[day];
          day.style = 'default';
          if (day.weekDay == "Lørdag" || day.weekDay == "Søndag"){
             day.style = 'danger';
          }
          day.restCols = new Array();
          for (column in day.columnNames) {
            if (day.restData[column] != null) {
              day.restCols.push("<strong>" + day.columnNames[column] + ":</strong> " + day.restData[column]);  
            }
          }  
      }
      var html = Mustache.to_html(this.template, weekAttrs);
      this.el.html(html);
    }
  }); 

  Tidsplan.Recipe.RecipeView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">{{name}}</h3></div>' + 
                '<div class="panel-body">' +
                '<div class="ingredients"><h5>Ingredienser</h5>{{{ingredients}}}</div><br />' +
                '<div class="recipe"><h5>Oppskrift</h5>{{recipe}}</div>' +
                '</div>' + 
              '</div>',
    initialize: function(options) {
      this.recipe = options.recipe;
      this.recipe.on("fetch:finished", this.render, this);
      this.el = options.el;
    },
    render: function() {
      var recipeAttrs = this.recipe.attrs();
      recipeAttrs.ingredients = recipeAttrs.ingredients.replace(/\|/g,'<br />');
      var html = Mustache.to_html(this.template, recipeAttrs);
      this.el.html(html);
    }
  }); 

  Tidsplan.Tasks.TasksView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">Planlagte oppgaver</h3></div>' + 
                '<ul class="list-group">' +
                  '{{#tasks}}' +
                    '<li class="list-group-item"><label class="checkbox"><input type="checkbox" value="">{{name}}</label></li>' +
                  '{{/tasks}}' +
                '</ul>' +
              '</div>',
    initialize: function(options) {
      this.tasks = options.tasks;
      this.tasks.on("fetch:finished", this.render, this);
      this.el = options.el;
    },
    render: function() {
      var tasksAttrs = this.tasks.attrs();
      var html = Mustache.to_html(this.template, tasksAttrs);
      this.el.html(html);
    }
  }); 

})(Simple, Mustache);