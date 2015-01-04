(function(Simple, Mustache) {

  window.Planner = window.Planner || {};
 

  Planner.startTasks = function() {
    var priorityTasks = new Planner.Tasks({priority: 1});
    var el = $("#prioritized");
    var view = new Planner.Tasks.TasksView({tasks: priorityTasks, el: el, panelTitle: "Planlagte oppgaver"});
    
    var backlog = new Planner.Tasks({priority: 0});
    var el = $("#backlog");
    var view = new Planner.Tasks.TasksView({tasks: backlog, el: el, panelTitle: "Ikke prioriterte oppgaver"});

    var weekly = new Planner.Tasks({recurrence: "weekly"});
    var el = $("#weekly");
    var view = new Planner.Tasks.TasksView({tasks: weekly, el: el, panelTitle: "Ukentlige oppgaver"});

    var biweeklyodd = new Planner.Tasks({recurrence: "bi-weekly-odd"});
    var el = $("#biweeklyodd");
    var view = new Planner.Tasks.TasksView({tasks: biweeklyodd, el: el, panelTitle: "Ukentlige oppgaver, annenhver uke oddetallsuker"});

    var biweeklyeven = new Planner.Tasks({recurrence: "bi-weekly-even"});
    var el = $("#biweeklyeven");
    var view = new Planner.Tasks.TasksView({tasks: biweeklyeven, el: el, panelTitle: "Ukentlige oppgaver, annenhver uke partallsuker"});
    
    var monthly = new Planner.Tasks({recurrence: "monthly"});
    var el = $("#monthly");
    var view = new Planner.Tasks.TasksView({tasks: monthly, el: el, panelTitle: "Månedlige oppgaver"});

    var january = new Planner.Tasks({recurrence: "january"});
    var el = $("#january");
    var view = new Planner.Tasks.TasksView({tasks: january, el: el, panelTitle: "Månedlige oppgaver januar"});

    
    var el = $("#createtask");
    var view = new Planner.Tasks.CreateTaskView({el: el});

    priorityTasks.fetch();
    backlog.fetch();
    weekly.fetch();
    biweeklyodd.fetch();
    biweeklyeven.fetch();
    monthly.fetch();
    january.fetch();


  }

  Planner.Tasks = Simple.Model.extend({
    dataType: "json",
    initialize: function(options) {
      if (options.priority != undefined) {
        this.url = "/tasks?priority=" + options.priority;
      } else if (options.recurrence != undefined) {
        this.url = "/tasks?recurrence=" + options.recurrence;
      }
    }
  });

  Planner.Tasks.CreateTaskView = Simple.View.extend({
    template: '<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">Lag ny oppgave</h3></div>' + 
                '<div class="panel-body">' +
                '<form role="form">' +
            '<div class="form-group">' +
              '<label for="description">Oppgavebeskrivelse</label>' +
              '<input type="text" class="form-control" id="description" name="description">' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="responsible">Ansvarlig</label>' +
              '<input type="text" class="form-control" id="responsible" name="responsible">' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="recurrence">Gjentakelse</label>' +
              '<select class="form-control" id="recurrence" name="recurrence">' +
              '<option></option>' +
              '<option value="weekly">Ukentlig</option>' +
              '<option value="bi-weekly-odd">Annenhver uke - oddetall</option>' +
              '<option value="bi-weekly-even">Annenhver uke - partall</option>' +
              '<option value="monthly">Månedlig</option>' +
              '<option value="january">Januar</option>' +
              '<option value="febuary">Februar</option>' +
              '<option value="march">Mars</option>' +
              '<option value="april">April</option>' +
              '<option value="may">Mai</option>' +
              '<option value="june">Juni</option>' +
              '<option value="july">Juli</option>' +
              '<option value="august">August</option>' +
              '<option value="september">September</option>' +
              '<option value="october">Oktober</option>' +
              '<option value="november">November</option>' +
              '<option value="december">Desember</option>' +
            '</select>' +
            '</div>' +
            '<button type="submit" class="btn btn-default">Lagre</button>' +
          '</form></div>'+
              '</div>',
    initialize: function (options) {
      this.el = options.el;
      this.render();
      this.setupListeners(this.el);
    }, 
    setupListeners: function (element) {

      element.find("form").on("submit", function(event) {
        event.preventDefault();
        
        $.ajax({
          url: "/saveTask",
          data: $(event.target).serialize(),
          success: function(data) {
            location.reload();
          },
          dataType: "json"
        });

      });
    },
    render: function (){
      this.el.html(this.template);
    }
  });



  Planner.Tasks.TasksView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">{{title}}</h3></div>' + 
                '<ul>' +
                  '{{#tasks}}' +
                    '<li><label class="checkbox"><input type="checkbox" value="{{_id}}" {{checked}}>{{description}}' +
                    '<span class="label label-info">{{responsible}}</span>' +
                    '<span class="label label-warning">{{recurrence}}</span></label>' +
                    '<button type="button" class="btn btn-default btn-sm done"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span></button>' +
                    '<button type="button" class="btn btn-default btn-sm priority"><span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span></button>' +
                    '<button type="button" class="btn btn-default btn-sm edit"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button>' +
                    '<button type="button" class="btn btn-default btn-sm trash"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>' +
                    '</li>' +
                  '{{/tasks}}' +
                '</ul>' +
              '</div>',
    initialize: function(options) {
      this.tasks = options.tasks;
      this.title = options.panelTitle;
      console.log(this.title);
      this.tasks.on("fetch:finished", this.render, this);
      this.el = options.el;
      
      this.setupListeners(this.el);
    },
    setupListeners : function(element) {
      var saveTask = new Planner.Tasks.SaveTask();  
      element.on("mouseup", "label.checkbox", function(event) {
        var task = $(this).find("input").attr("value");
        var done = $(this).find("input").prop('checked');
        saveTask.completeTask(task,!done);
      });
      element.on("click", "button.priority", function(event) {
        var task = $(this).parent("li").find("input").attr("value");
        saveTask.prioritizeTask(task,1);
        location.reload();    
      });
    },
    render: function() {
      var tasksObj = {};
      tasksObj.title = this.title;
      tasksObj.tasks = new Array();
      var tasksAttrs = this.tasks.attrs().tasks;
      for (index in tasksAttrs) {
        var taskData = tasksAttrs[index];
        taskData.checked = taskData.done == "true" ? "checked" : "";
        tasksObj.tasks.push(taskData)
      }
      var html = Mustache.to_html(this.template, tasksObj);
      this.el.html(html);
    }
  }); 
  
  Planner.Tasks.SaveTask = Simple.Model.extend({
    dataType: "json",
    initialize: function() {},
    completeTask: function(task,done) {
        this.url = "/completeTask?task=" + task + "&done=" + done;  
        this.fetch();
    },
    prioritizeTask: function(task,priority) {
        this.url = "/prioritizeTask?task=" + task + "&priority=" + priority;  
        this.fetch();
    }
  });


})(Simple, Mustache);