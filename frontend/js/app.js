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
    var el = $("#calendar");
    var view = new Planner.Calendar.CalendarView({calendar: calendar, el: el});    
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
      console.log(this.week);
      var weekAttrs = this.week.attrs();
        for (day in weekAttrs.days) {
          var day = weekAttrs.days[day];
          day.style = 'default';
          if (day.weekDay == "Lørdag" || day.weekDay == "Søndag"){
             day.style = 'danger';
          }
          console.log(day.columnNames);
          console.log(day.restData);
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
    template:'<div class="page-header"><h1>Oktober</h1></div>' +
    '<div class="panel-group" id="accordion">' +
      '{{#days}}' +
          '<div class="panel panel-{{style}}">' +
            '<div class="panel-heading" style="position:relative"><h4 class="panel-title">' + 
            '<a data-toggle="collapse" data-target="#collapse{{id}}">' +
            '{{weekDay}} {{date}}: {{plans}}</a></h4>' + 
            '<button type="button" class="btn btn-sm btn-primary edit" style="position:absolute;right:10px;top:10px">Endre</button></div>' +
          '<div id="collapse{{id}}" class="panel-collapse collapse">' +
            '<ul class="list-group">' +
              '<li class="list-group-item">Dagens middag: {{menuOfTheDay}}</li>' +
              '{{#restCols}}' + 
              '<li class="list-group-item">{{{.}}}</li>' +
              '{{/restCols}}' +
            '</ul></div></div>' +
      '{{/days}}</div>',
    initialize: function(options) {
      this.calendar = options.calendar;
      this.el = options.el;
      var date = new Date();
      var month = date.getMonth();
      this.calendar.getMonth(month);
      $(".btn-group.months .btn#" + month).addClass("active");
      this.calendar.on("fetch:finished", this.render, this);
      var calendar = this.calendar;
      $(".btn-group.months .btn").on("click", function(event) {
        var month = $(this).attr("id");
        calendar.getMonth(month);
        calendar.on("fetch:finished", this.render, this);
        $(this).addClass("active");
        $(this).siblings(".btn").removeClass("active");
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
            day.restCols.push("<strong>" + day.columnNames[column] + ":</strong> " + day.restData[column]);  
  
          }  
      }
      var html = Mustache.to_html(this.template, calendarAttrs);
      this.el.html(html);
    }
  }); 

  /*Planner.Calendar.CalendarView = Simple.View.extend({
    template:'<button type="button" class="btn btn-lg btn-primary edit">Endre</button>' +
    '<table class="table table-striped">' + 
      '<thead><tr><th>#</th>' + 
      '{{#columnNames}}' +
        '<th>{{.}}</th>' +
      '{{/columnNames}}' +
      '</tr></thead><tbody>' +
      '{{#days}}' + 
        '<tr class="{{style}}">' +
          '<td>{{{date}}}</td>' +  
          '{{#restData}}' + 
            '<td class="editable">{{{.}}}</td>' +
          '{{/restData}}' +
          '</tr>' +
        '{{/days}}' +
      '</tbody></table>',
    initialize: function(options) {
      this.calendar = options.calendar;
      this.el = options.el;
      var date = new Date();
      var month = date.getMonth();
      this.calendar.getMonth(month);
      $(".btn-group.months .btn#" + month).addClass("active");
      this.calendar.on("fetch:finished", this.render, this);
      var calendar = this.calendar;
      $(".btn-group.months .btn").on("click", function(event) {
        var month = $(this).attr("id");
        calendar.getMonth(month);
        calendar.on("fetch:finished", this.render, this);
        $(this).addClass("active");
        $(this).siblings(".btn").removeClass("active");
        //saveTask.on("fetch:finished", function() {window.location.reload()}, this);
      });
      var el = this.el;
      this.el.on("click", "button.edit", function(event) {
        $(event.target).addClass("btn-danger").removeClass("btn-primary");
        var tds = el.find("td.editable");
        tds.each(function(index, td){
          var text = $(td).text();
          $(td).html( "<input type='text' value='"+text+"'/>");
        });
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
          for (column in calendarAttrs.columnNames) {
            if (day.restData[column] == null) {
              day.restData[column] = "";  
            }
          }  
      }
      var html = Mustache.to_html(this.template, calendarAttrs);
      this.el.html(html);
    }
  }); */

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
        console.log(this);
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