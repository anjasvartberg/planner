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
    initialize: function() {
      this.recipes = new Planner.Recipes();
      this.recipes.fetch();
      this.recipes.on("fetch:finished", this.renderRecipes, this);
    }, 
    template: '<div class="panel panel-{{style}}" id="{{id}}">' +
        '<div class="panel-heading" style="position:relative"><h4 class="panel-title">' + 
        '<a data-toggle="collapse" data-target="#collapse{{id}}">' +
        '{{weekDay}} {{date}}: {{plans}}</a></h4>' + 
        '<button type="button" class="btn btn-xs btn-primary edit" style="position:absolute;right:10px;top:10px">Endre</button>' +
        '<button type="button" class="btn btn-xs btn-danger save" style="position:absolute;right:10px;top:10px;display:none">Lagre</button></div>' +
      '<div id="collapse{{id}}" class="panel-collapse {{collapse}}">' +
        '<form>' +
        '<ul class="list-group">' +
          '{{#restCols}}' + 
          '<li class="list-group-item">{{{.}}}</li>' +
          '{{/restCols}}' +
        '</ul></form></div></div>',
    templateDropdown: '<select name="3" class="form-control">' +
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
          var text = $(field).html() != "null" ? $(field).html() : "";
          $(field).parent("li").show();
          if ($(field).hasClass("dinner")) {
            $(field).html(that.recipesHtml);
            $(field).find("select").val(text);
          } else {
            $(field).html( "<input name='" + (index+2) + "' class='form-control' style='width: 100%' type='text' value='"+text+"'/>");  
          }
        });
      });
      element.on("click", "button.save", function(event) {
        var that = $(this); 
        that.hide();
        that.siblings('.edit').show();
        var editableFields = that.parents(".panel").find(".editable");
        $.post( 
           //TODO: Finn ut en måte å få med måned på, slik at man vet hvilket sheet man skal oppdatere
           "/updateDay?day=" + that.parents(".panel").attr("id") + "&month=" + $("h1.month").text(),
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
    renderDay: function (day, collapse) {
      day.style = 'default';
      if (day.weekDay == "Lørdag" || day.weekDay == "Søndag"){
         day.style = 'danger';
      }
      day.collapse = collapse; 
      day.plans = day.restData[0];
      day.restCols = new Array();
      for (column in day.columnNames) {
        var spanClass = column == "1" ? "editable dinner" : "editable";
        day.restCols.push("<strong>" + day.columnNames[column] + ":</strong> <span class='"+ spanClass +"'>" + day.restData[column] + "</span>");  
      }  
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
    template: new Planner.Day.SingleDayView().template,
    initialize: function(options) {
      this.day = options.day;
      this.day.on("fetch:finished", this.render, this);
      this.el = options.el;
      this.dayView = new Planner.Day.SingleDayView();
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
      '{{#days}}<div class="col-md-6">' + new Planner.Day.SingleDayView().template +
      '</div>{{/days}}',
    initialize: function(options) {
      this.week = options.week;
      this.week.on("fetch:finished", this.render, this);
      this.el = options.el;
      this.dayView = new Planner.Day.SingleDayView();
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
      '{{#days}}' + new Planner.Day.SingleDayView().template +
      '{{/days}}</div>',
    initialize: function(options) {
      this.calendar = options.calendar;
      this.el = options.el;
      this.dayView = new Planner.Day.SingleDayView();
      
      var date = new Date();
      var month = date.getMonth();
      this.calendar.getMonth(month);
      this.calendar.on("fetch:finished", this.render, this);
      $(".btn-group.months .btn#" + month).addClass("active");
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
      this.dayView.setupListeners(this.el);
    },
    render: function() {
      var calendarAttrs = this.calendar.attrs();
      for (day in calendarAttrs.days) {
        this.dayView.renderDay(calendarAttrs.days[day], "collapse");
      }
      var html = Mustache.to_html(this.template, calendarAttrs);
      this.el.html(html);
      this.dayView.hideEmptyFields();
    }
  }); 

})(Simple, Mustache);