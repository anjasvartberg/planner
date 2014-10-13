var Tidsplan = {};

process.env = process.env || {};

var http = require('http');
var fs = require('fs');
var url = require("url");

Tidsplan.Sheets = require(process.cwd() + '/backend/tidsplan.js');


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
          Tidsplan.Sheets.getToday(Tidsplan.writeJson(response));
    } else if (parsedUrl.pathname == "/week") {
        Tidsplan.Sheets.getComingWeek(Tidsplan.writeJson(response));
    } else if (parsedUrl.pathname == "/recipe") {
        Tidsplan.Sheets.getTodaysRecipe(Tidsplan.writeJson(response));
    } else if (parsedUrl.pathname == "/tasks") {
        Tidsplan.Sheets.getPlannedTasks(Tidsplan.writeJson(response));
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

Tidsplan.writeJson = function(response) {
    return function(data) {
        response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
        response.end(JSON.stringify(data), 'utf-8');          
    }
}



 