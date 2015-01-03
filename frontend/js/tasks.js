(function(Simple, Mustache) {

  window.Planner = window.Planner || {};
 
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
                    '<li><label class="checkbox"><input type="checkbox" value="{{_id}}" {{checked}}>{{description}}</label></li>' +
                  '{{/tasks}}' +
                '</ul>' +
              '</div>',
    initialize: function(options) {
      this.tasks = options.tasks;
      this.tasks.on("fetch:finished", this.render, this);
      this.el = options.el;
      var saveTask = new Planner.Tasks.SaveTask();  
      this.el.on("mouseup", "label.checkbox", function(event) {
        var task = $(this).find("input").attr("value");
        var done = $(this).find("input").prop('checked');
        console.log(done)
        saveTask.saveTask(task,!done);
      });

    },
    render: function() {
      var tasksObj = {};
      
      tasksObj.tasks = new Array();
      

      var tasksAttrs = this.tasks.attrs().tasks;
      for (index in tasksAttrs) {
        var taskData = tasksAttrs[index];
        taskData.checked = taskData.done == "true" ? "checked" : "";
        console.log(taskData)
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