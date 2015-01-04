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

    var biweekly = new Planner.Tasks({recurrence: "bi-weekly"});
    var el = $("#biweekly");
    var view = new Planner.Tasks.TasksView({tasks: biweekly, el: el, panelTitle: "Ukentlige oppgaver, annenhver uke"});

    var monthly = new Planner.Tasks({recurrence: "monthly"});
    var el = $("#monthly");
    var view = new Planner.Tasks.TasksView({tasks: monthly, el: el, panelTitle: "Månedlige oppgaver"});
    
    priorityTasks.fetch();
    backlog.fetch();
    weekly.fetch();
    biweekly.fetch();
    monthly.fetch();


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
  
  Planner.RecurringTasks = Simple.Model.extend({
    dataType: "json",
    initialize: function(recurrence) {
        this.url = "/tasks?recurrence=" + recurrence;
    }
  });



  Planner.Tasks.TasksView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">{{title}}</h3></div>' + 
                '<ul>' +
                  '{{#tasks}}' +
                    '<li><label class="checkbox"><input type="checkbox" value="{{_id}}" {{checked}}>{{description}}</label></li>' +
                  '{{/tasks}}' +
                '</ul>' +
              '</div>',
    initialize: function(options) {
      this.tasks = options.tasks;
      this.title = options.panelTitle;
      console.log(this.title);
      this.tasks.on("fetch:finished", this.render, this);
      this.el = options.el;
      var saveTask = new Planner.Tasks.SaveTask();  
      this.el.on("mouseup", "label.checkbox", function(event) {
        var task = $(this).find("input").attr("value");
        var done = $(this).find("input").prop('checked');
        saveTask.saveTask(task,!done);
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
    saveTask: function(task,done) {
        this.url = "/completeTask?task=" + task + "&done=" + done;  
        this.fetch();
    }
  });


})(Simple, Mustache);