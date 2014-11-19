(function(Simple, Mustache) {

  window.Planner = window.Planner || {};

  Planner.startCalendar = function() {
    var calendar = new Planner.Calendar();
    var recipes = new Planner.Recipes();
    var el = $("#calendar");
    var view = new Planner.Calendar.CalendarView({calendar: calendar, recipes: recipes, el: el});     
    recipes.fetch();
  }

  Planner.Day = Simple.Model.extend({
    dataType: "json",
    initialize: function(date) {
      if (date != undefined) {
        this.url = "/day?date=" + date;
      } else {
        this.url = "/day";
      }
    }
  });

  Planner.Week = Simple.Model.extend({
    dataType: "json",
    initialize: function(date) {
      if (date != undefined) {
        this.url = "/week?startDate=" + date;
      } else {
        this.url = "/week";
      }
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

  Planner.Day.SingleDayView = Simple.Model.extend({
    template: '<div class="panel panel-{{style}}" id="{{id}}">' +
        '<div class="panel-heading" style="position:relative"><h4 class="panel-title">' + 
        '<a data-toggle="collapse" data-target="#collapse{{id}}">' +
        '{{weekDay}} {{day}}. {{month}} {{year}}: {{data.plans}}</a></h4>' + 
        '<button type="button" class="btn btn-xs btn-primary edit" style="position:absolute;right:10px;top:10px">Endre</button>' +
        '<button type="button" class="btn btn-xs btn-danger save" style="position:absolute;right:10px;top:10px;display:none">Lagre</button></div>' +
      '<div id="collapse{{id}}" class="panel-collapse {{collapse}}">' +
        '<form>' +
        '<ul class="list-group">' +
          '{{#dayData}}' + 
          '<li class="list-group-item">{{{.}}}</li>' +
          '{{/dayData}}' +
        '</ul></form></div></div>',
    templateDropdown: '<select name="menu" class="form-control">' +
        '<option></option>'+
        '{{#recipes}}'+
        '<option>{{name}}</option>'+
        '{{/recipes}}'+
      '</select>',
    initialize: function(options) {
      this.day = options.day;
      this.el = options.el;
      this.recipes = new Planner.Recipes();
      this.recipes.fetch();
      this.recipes.on("fetch:finished", this.renderRecipes, this);

      this.renderDay(options.collapse);
      this.setupListeners(this.el);
    }, 
    setupListeners: function(element){
      var that = this;
      element.on("click", "button.edit", function(event) {
        $(this).hide();
        $(this).siblings('.save').show();
        $(this).parents(".panel").find(".collapse").collapse('show');
        var editableFields = $(this).parents(".panel").find(".editable");
        editableFields.each(function(index, field){
          var field = $(field);
          var text = $(field).html() != "null" ? field.html() : "";
          field.parent("li").show();
          if (field.hasClass("menu")) {
            field.html(that.recipesHtml);
            field.find("select").val(text);
          } else {
            field.html( "<input name='" + field.attr("class").split(" ")[1] + "' class='form-control' style='width: 100%' type='text' value='"+text+"'/>");  
          }
        });
      });
      element.on("click", "button.save", function(event) {
        $(this).hide();
        $(this).siblings('.edit').show();
        var editableFields = $(this).parents(".panel").find(".editable");
        $.post( 
           //TODO: Finn ut en måte å få med måned på, slik at man vet hvilket sheet man skal oppdatere
           "/updateDay?day=" + that.day.day + "&month=" + that.date.getMonth(),
           editableFields.find("input, select").serialize(),
           function(data) {
              editableFields.each(function(index, field){
                var text = $(field).find("input, select").val();
                $(field).html(text);
                if (text == "null" || text == "") {
                  $(field).parent("li").hide();
                }
              });           
            }

        );

      });
    },
    renderDay: function (collapse) {
      this.date = new Date(this.day.year, this.day.month, this.day.day);
      var weekDay = this.date.getDay();
      
      var renderData = this.day;
      renderData.month = Planner.monthNames[this.day.month].toLowerCase();
      renderData.id = this.day.day;
      renderData.style = 'default';
      if (weekDay == 6 || weekDay == 0){
         renderData.style = 'danger';
      }
      renderData.collapse = collapse; 
      renderData.dayData = new Array();
      for (i in this.day.data) {
        renderData.dayData.push("<strong>" + i + ":</strong> <span class='editable "+ i +"'>" + this.day.data[i] + "</span>");  
      } 
      var html = Mustache.to_html(this.template, renderData);
      this.el.html(html);
      this.hideEmptyFields();    
       
    },
    renderRecipes: function(element) {
        var recipesAttrs = this.recipes.attrs();  
        var html = Mustache.to_html(this.templateDropdown, recipesAttrs);
        this.recipesHtml = html;
    },
    hideEmptyFields: function() {
      var editableFields = $(this.el).find(".editable");
      editableFields.each(function(index, field){
        var text = $(field).html();
        if (text == "null" || text == "") {
          $(field).parent("li").hide();
        }
      });
    }

  });

  Planner.Day.DayView = Simple.View.extend({
    template: "",
    initialize: function(options) {
      this.day = options.day;
      this.el = options.el;
      this.date = options.date;

      this.day.on("fetch:finished", this.render, this);
    },
    render: function() {
      var dayAttrs = this.day.attrs();

      var date = this.date.getDate();
      var month = this.date.getMonth();
      var year = this.date.getFullYear();
      
      var dummyDay = new Planner.Calendar.DummyDay(date, month, year);
      
      var dayData = this.day.attrs().days;
      if (dayData != null) {
        dayData = dayData[0];
        for (i in dayData.data) {
          dummyDay.data[i] = dayData.data[i];
        }
      }

      var html = Mustache.to_html(this.template, dummyDay);
      this.el.html(html);
       
      var dayView = new Planner.Day.SingleDayView({day: dummyDay, el: this.el});

    }
  });

  Planner.Week.WeekView = Simple.View.extend({
    template:'<div class="page-header"><h1>Neste uke</h1></div>' +
      '{{#days}}<div class="col-md-6">' +
      '<div id="date{{day}}"></div>' +
      '</div>{{/days}}',
    initialize: function(options) {
      this.week = options.week;
      this.el = options.el;

      this.week.on("fetch:finished", this.render, this);
    },
    render: function() {
      var date = new Date();
      var daysInWeek = Planner.Calendar.GetDaysInWeek(date.getDate(), date.getMonth(), date.getFullYear());
      var weekObj = {};
      
      weekObj.days = new Array();
      for (index in daysInWeek) {
        var date = daysInWeek[index].getDate();
        var month = daysInWeek[index].getMonth();
        var year = daysInWeek[index].getFullYear();
        var dayObj = new Planner.Calendar.DummyDay(date, month, year);
        weekObj.days.push(dayObj);
      }

      var calenderAttrs = this.week.attrs().days;
      for (index in calenderAttrs) {
        var dayData = calenderAttrs[index];
        var day = dayData.day;
        for (weekday in weekObj.days) {
          if (weekObj.days[weekday].day == day) {
            var dummyDay = weekObj.days[weekday];
            for (i in dayData.data) {
              dummyDay.data[i] = dayData.data[i];
            }
          }
        }
      }

      var html = Mustache.to_html(this.template, weekObj);
      this.el.html(html);
     
      for (index in weekObj.days) {
        var day = weekObj.days[index];
        var dayel = $("#date" + day.day);
        
        var dayView = new Planner.Day.SingleDayView({day: day, el: dayel});
      }
      
    }
  }); 

  Planner.Calendar.CalendarView = Simple.View.extend({
    template:'<div class="page-header"><h1 class="month">{{name}}</h1></div>' +
    '<div class="panel-group" id="accordion">' +
      '{{#days}}' +
      '<div id="date{{day}}"></div>' +
      '{{/days}}</div>',
    initialize: function(options) {
      this.calendar = options.calendar;
      this.el = options.el;
      
      var date = new Date();
      this.month = date.getMonth();
      this.year = date.getFullYear();
      this.calendar.getMonth(this.month);
      this.calendar.on("fetch:finished", this.render, this);
      $(".btn-group.months .btn#" + this.month).addClass("active");
      this.setupListeners();
    },
    setupListeners: function () {
      var calendar = this.calendar;
      var that = this;
      $(".btn-group.months .btn").on("click", function(event) {
        that.month = $(this).attr("id");
        calendar.getMonth(that.month);
        calendar.on("fetch:finished", this.render, this);
        $(this).addClass("active");
        $(this).siblings(".btn").removeClass("active");
      });
      //this.dayView.setupListeners(this.el);
    },
    render: function() {
      var month = this.month;
      var year = this.year;
      var daysInMonth = Planner.Calendar.GetDaysInMonth(Number(month), year);
      var monthObj = {};
      
      monthObj.name = Planner.monthNames[this.month];
      monthObj.days = new Array();
      for (index in daysInMonth) {
        var date = daysInMonth[index].getDate();
        var dayObj = new Planner.Calendar.DummyDay(date, month, year);
        monthObj.days.push(dayObj);
      }

      var calenderAttrs = this.calendar.attrs().days;
      for (index in calenderAttrs) {
        var dayData = calenderAttrs[index];
        var day = dayData.day;
        var dummyDay = monthObj.days[day-1];
        for (i in dayData.data) {
          dummyDay.data[i] = dayData.data[i];
        }
      }

      var html = Mustache.to_html(this.template, monthObj);
      this.el.html(html);
     
      for (index in monthObj.days) {
        var day = monthObj.days[index];
        var dayel = $("#date" + day.day);
        
        var dayView = new Planner.Day.SingleDayView({day: day, el: dayel, collapse: "collapse"});
      }
      
    }
  }); 

  Planner.Calendar.DummyDay = function(day, month, year) {
    this.day = day;
    this.month = month;
    this.year = year;
    this.date = new Date(year, month, day);
    this.data = new Array();
    this.data.plans = "";
    this.data.menu = "";
    this.data.dog = "";
    this.data.person1 = "";
    this.data.person2 = "";
    this.data.dinner = "";
    this.data.ideas = "";
     
  }

  Planner.Calendar.GetDaysInMonth = function(month, year) {
       var date = new Date(year, month, 1);
       var days = [];
       while (date.getMonth() === month) {
          days.push(new Date(date));
          date.setDate(date.getDate() + 1);
       }
       return days;
  }

   Planner.Calendar.GetDaysInWeek = function(day, month, year) {
       var date = new Date(year, month, day+1);
       var days = [];
       while (date.getDate() < day+8) {
          days.push(new Date(date));
          date.setDate(date.getDate() + 1);
       }
       return days;
  }

  Planner.monthNames = [ "Januar", "Februar", "Mars", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Desember" ];


})(Simple, Mustache);