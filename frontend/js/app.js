(function(Simple, Mustache) {

  window.Planner = window.Planner || {};

  Planner.start = function() {
    var day = new Planner.Day();
    var el = $("#day");
    var view = new Planner.Day.DayView({day: day, el: el});
    
    var week = new Planner.Week();
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

  Planner.startCalendar = function() {
    var calendar = new Planner.Calendar();
    var recipes = new Planner.Recipes();
    var el = $("#calendar");
    var view = new Planner.Calendar.CalendarView({calendar: calendar,recipes: recipes, el: el});    
  
    recipes.fetch();
  }

  Planner.Day = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/day";
    }
  });

  Planner.Week = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/week";
    }
  });

  Planner.Recipe = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/recipe";
    }
  });

  Planner.Tasks = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/tasks";
    }
  });

  Planner.Calendar = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
    },
    getMonth: function(month) {
        this.url = "/calendar?month=" + month; 
        this.fetch(); 
    }
  });

 Planner.Recipes = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/recipes"; 
    }
  });

  Planner.Day.DayView = Simple.View.extend({
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

  Planner.Week.WeekView = Simple.View.extend({
    template:'<div class="page-header"><h1>Neste uke</h1></div>' +
      '{{#days}}' +
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
      '{{/days}}',
    initialize: function(options) {
      this.week = options.week;
      this.week.on("fetch:finished", this.render, this);
      this.el = options.el;
    
    },
    render: function() {
      var weekAttrs = this.week.attrs();
        for (day in weekAttrs.days) {
          var day = weekAttrs.days[day];
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

  Planner.Calendar.CalendarView = Simple.View.extend({
    template:'<div class="page-header"><h1 class="month">{{name}}</h1></div>' +
    '<div class="panel-group" id="accordion">' +
      '{{#days}}' +
          '<div class="panel panel-{{style}}" id="{{id}}">' +
            '<div class="panel-heading" style="position:relative"><h4 class="panel-title">' + 
            '<a data-toggle="collapse" data-target="#collapse{{id}}">' +
            '{{weekDay}} {{date}}: {{plans}}</a></h4>' + 
            '<button type="button" class="btn btn-xs btn-primary edit" style="position:absolute;right:10px;top:10px">Endre</button>' +
            '<button type="button" class="btn btn-xs btn-danger save" style="position:absolute;right:10px;top:10px;display:none">Lagre</button></div>' +
          '<div id="collapse{{id}}" class="panel-collapse collapse">' +
            '<form>' +
            '<ul class="list-group">' +
              '<li class="list-group-item">Dagens planer: <span class="editable">{{plans}}</span> </li>' +
              '<li class="list-group-item">Dagens middag: <span class="editable dinner">{{menuOfTheDay}}</span></li>' +
              '{{#restCols}}' + 
              '<li class="list-group-item">{{{.}}}</li>' +
              '{{/restCols}}' +
            '</ul></form></div></div>' +
      '{{/days}}</div>',
    templateDropdown: '<select name="3" class="form-control">' +
        '<option></option>'+
        '{{#recipes}}'+
        '<option>{{name}}</option>'+
        '{{/recipes}}'+
      '</select>',
    initialize: function(options) {
      this.calendar = options.calendar;
      this.recipes = options.recipes;
      this.el = options.el;
      
      var date = new Date();
      var month = date.getMonth();
      this.calendar.getMonth(month);
      this.calendar.on("fetch:finished", this.render, this);
      $(".btn-group.months .btn#" + month).addClass("active");
    
      this.recipes.on("fetch:finished", this.renderRecipes, this);

      this.setupListeners();
      
    },
    setupListeners: function () {
      var calendar = this.calendar;
      var that = this;
      $(".btn-group.months .btn").on("click", function(event) {
        var month = $(this).attr("id");
        calendar.getMonth(month);
        calendar.on("fetch:finished", this.render, this);
        $(this).addClass("active");
        $(this).siblings(".btn").removeClass("active");
      });
      this.el.on("click", "button.edit", function(event) {
        $(this).hide();
        $(this).siblings('.save').show();
        $(this).parents(".panel").find(".collapse").collapse('show');
        var editableFields = $(this).parents(".panel").find(".editable");
        editableFields.each(function(index, field){
          var text = $(field).html();
          if ($(field).hasClass("dinner")) {
            $(field).html(that.recipesHtml);
            $(field).find("select").val(text);
          } else {
            $(field).html( "<input name='" + (index+2) + "' class='form-control' style='width: 100%' type='text' value='"+text+"'/>");  
          }
        });
      });
      this.el.on("click", "button.save", function(event) {
        var that = $(this); 
        that.hide();
        that.siblings('.edit').show();
        var editableFields = that.parents(".panel").find(".editable");
        $.post( 
           "/updateDay?day=" + that.parents(".panel").attr("id") + "&month=" + $("h1.month").text(),
           editableFields.find("input, select").serialize(),
           function(data) {
              editableFields.each(function(index, field){
                var text = $(field).find("input, select").val();
                $(field).html(text);
              });           
            }

        );

      });
    },
    render: function() {
      var calendarAttrs = this.calendar.attrs();
      for (day in calendarAttrs.days) {
        var day = calendarAttrs.days[day];
        day.style = 'default';
        if (day.weekDay == "Lørdag" || day.weekDay == "Søndag"){
           day.style = 'danger';
        }
        day.restCols = new Array();
        for (column in day.columnNames) {
          day.restCols.push("<strong>" + day.columnNames[column] + ":</strong> <span class='editable'>" + day.restData[column] + "</span>");  
        }  
      }
      var html = Mustache.to_html(this.template, calendarAttrs);
      this.el.html(html);
    },
    renderRecipes: function(element) {
        var recipesAttrs = this.recipes.attrs();  
        var html = Mustache.to_html(this.templateDropdown, recipesAttrs);
        this.recipesHtml = html;    
      
    }
  }); 


  Planner.Recipe.RecipeView = Simple.View.extend({
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


})(Simple, Mustache);