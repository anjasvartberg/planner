var Planner = {};

process.env = process.env || {};

var http = require('http');
var fs = require('fs');
var url = require("url");

Planner.Sheets = require(process.cwd() + '/backend/sheets.js');


var server = http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});

    var fileroot = process.cwd() + "/frontend";

    var parsedUrl = url.parse(request.url, true);
    
    if (parsedUrl.pathname == "/") {
        response.writeHead(302, {'Location': 'index.html'});
        response.end();
        return;
    }

    if (parsedUrl.pathname == "/day") {
          Planner.Sheets.getToday(Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/week") {
        Planner.Sheets.getComingWeek(Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/recipe") {
        Planner.Sheets.getTodaysRecipe(Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/tasks") {
        Planner.Sheets.getPlannedTasks(Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/completeTask") {
        Planner.Sheets.setCompletedTask(parsedUrl.query.task, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/calendar") {
        Planner.Sheets.getCalendar(Number(parsedUrl.query.month), Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/updateDay") {
        Planner.Sheets.updateDay(Number(parsedUrl.query.day), parsedUrl.query.month, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/recipes") {
        console.log("Get recipes");
        Planner.writeJson(response)("test");
    } else {
        fs.readFile(fileroot + request.url, function(error, content) {
            if (error) {
                console.log('ERROR requesting ' + request.url);
                console.log(error);
                response.writeHead(500);
                response.end();
            } else {
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.end(content, 'utf-8');
            }
        });     
    }

  

});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");

Planner.writeJson = function(response) {
    return function(data) {
        response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
        response.end(JSON.stringify(data), 'utf-8');          
    }
}



 