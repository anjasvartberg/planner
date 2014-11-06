(function(Simple, Mustache) {

  window.Planner = window.Planner || {};

  Planner.Day = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/day";
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
    initialize: function(options) {
      this.day = options.day;
      this.el = options.el;
      this.recipes = new Planner.Recipes();
      this.recipes.fetch();
      this.recipes.on("fetch:finished", this.renderRecipes, this);

      this.renderDay("collapse");
      this.setupListeners(this.el);
    }, 
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
      console.log(this.date);
      console.log(this.date);

      var renderData = this.day;
      renderData.month = Planner.monthNames[this.day.month].toLowerCase();
      renderData.id = this.day.day;
      renderData.style = 'default';
      if (weekDay == 6 || weekDay == 7){
         renderData.style = 'danger';
      }
      renderData.collapse = collapse; 
      renderData.dayData = new Array();
      for (i in this.day.data) {
        renderData.dayData.push("<strong>" + i + ":</strong> <span class='editable "+ i +"'>" + this.day.data[i] + "</span>");  
      } 
      var html = Mustache.to_html(this.template, renderData);
      this.el.html(html);
       
    },
    renderRecipes: function(element) {
        var recipesAttrs = this.recipes.attrs();  
        var html = Mustache.to_html(this.templateDropdown, recipesAttrs);
        this.recipesHtml = html;    
    },
    hideEmptyFields: function() {
      var editableFields = $(".panel").find(".editable");
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
      this.day.on("fetch:finished", this.render, this);
      this.el = options.el;
      this.dayView = new Planner.Day.SingleDayView({day: this.day, el: this.el});
      this.dayView.setupListeners(this.el);
      
    },
    render: function() {
      var dayAttrs = this.day.attrs();
      this.dayView.renderDay(dayAttrs, "");    
      var html = Mustache.to_html(this.template, dayAttrs);
      this.el.html(html);
      this.dayView.hideEmptyFields();

    }
  });

  Planner.Week.WeekView = Simple.View.extend({
    template:'<div class="page-header"><h1>Neste uke</h1></div>' +
      '{{#days}}<div class="col-md-6">' +
      '<div id="{{day}}"</div>' +
      '</div>{{/days}}',
    initialize: function(options) {
      this.week = options.week;
      this.week.on("fetch:finished", this.render, this);
      this.el = options.el;
      this.dayView = new Planner.Day.SingleDayView({day: this.week, el: this.el});
      this.dayView.setupListeners(this.el);
      
    },
    render: function() {
      var weekAttrs = this.week.attrs();
      for (day in weekAttrs.days) {
        this.dayView.renderDay(weekAttrs.days[day], "");    
      }
      var html = Mustache.to_html(this.template, weekAttrs);
      this.el.html(html);
      this.dayView.hideEmptyFields();

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
      console.log(month);
      var daysInMonth = Planner.Calendar.GetDaysInMonth(Number(month), year);
      var monthObj = {};
      console.log(daysInMonth);
      monthObj.name = Planner.monthNames[this.month];
      monthObj.days = new Array();
      for (index in daysInMonth) {
        var date = daysInMonth[index].getDate();
        var dayObj = new Planner.Calendar.DummyDay(date, month, year);
        monthObj.days.push(dayObj);
      }

      var calenderAttrs = this.calendar.attrs().days;
      if (calenderAttrs.length > 1) {
        for (index in calenderAttrs) {
          var dayData = calenderAttrs[index];
          var day = dayData.day;
          var dummyDay = monthObj.days[day-1];
          for (i in dayData.data) {
            dummyDay.data[i] = dayData.data[i];
          }
        }
      }

      var html = Mustache.to_html(this.template, monthObj);
      this.el.html(html);
     
      for (index in monthObj.days) {
        var day = monthObj.days[index];
        var dayel = $("#date" + day.day);
        
        var dayView = new Planner.Day.SingleDayView({day: day, el: dayel});
      }
      
    }
  }); 

  Planner.Calendar.DummyDay = function(day, month, year) {
    this.day = day;
    this.month = month;
    this.year = year;
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
       console.log(date.getMonth() === month);
       console.log(month);
       console.log(date.getMonth());
       while (date.getMonth() === month) {
          days.push(new Date(date));
          date.setDate(date.getDate() + 1);
       }
       return days;
  }

  Planner.monthNames = [ "Januar", "Februar", "Mars", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Desember" ];


})(Simple, Mustache);