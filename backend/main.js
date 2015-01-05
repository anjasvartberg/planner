var Planner = {};

process.env = process.env || {};
var port = process.env.PORT || 8000;
var host = process.env.PORT ? "https://tidsplan.herokuapp.com" : "http://localhost:"+port;

var http = require('http');
var fs = require('fs');
var url = require("url");
var google = require('googleapis');
var querystring = require("querystring");

Planner.Calendar = require(process.cwd() + '/backend/calendar.js');
Planner.Todo = require(process.cwd() + '/backend/tasks.js');
Planner.Cookbook = require(process.cwd() + '/backend/cookbook.js');
Planner.oauth2Client = new google.auth.OAuth2(process.env.client_id, process.env.client_secret, host+'/oauth2callback');

var sessions = require(process.cwd() + '/backend/lib/session.js');

var server = http.createServer(function (request, response) {
    var session = sessions.lookupOrCreate(request);

    var fileroot = process.cwd() + "/frontend";

    var parsedUrl = url.parse(request.url, true);
    
    console.log(request.url);

    if (!session.data.accessToken && parsedUrl.pathname != "/login" && parsedUrl.pathname != "/oauth2callback") {
        response.writeHead(302, {'Location': 'login'});
        response.end();
        return;
    } else if (parsedUrl.pathname == "/login") {
        var redirectUrl = Planner.oauth2Client.generateAuthUrl({
            access_type: 'online',
            scope: 'https://spreadsheets.google.com/feeds'
        });
        response.writeHead(302, {'location': redirectUrl});
        response.end();
        return;
    } else if (parsedUrl.pathname == "/oauth2callback") {
        Planner.oauth2Client.getToken(parsedUrl.query.code, function(err, tokens) {
            if(err) throw new Error(err);
            Planner.oauth2Client.setCredentials(tokens);
            session.data.accessToken = tokens.access_token;
            response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
            response.setHeader('location', "/");
            response.writeHead(302);
            response.end();
        
        });
        return;
    }
    
    response.setHeader("Content-Type", "text/plain");
    
    if (parsedUrl.pathname == "/") {
        response.writeHead(302, {'Location': 'index.html'});
        response.end();
        return;
    }

    if (parsedUrl.pathname == "/day") {
        var date = parsedUrl.query.date != undefined ? parsedUrl.query.date : new Date(); 
        Planner.Calendar.getCalendarDay(date, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/week") {
        var date = parsedUrl.query.startDate != undefined ? parsedUrl.query.startDate : new Date(); 
        Planner.Calendar.getCalendarWeek(date, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/calendar") {
        Planner.Calendar.getCalendarMonth(Number(parsedUrl.query.month), Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/recipe") {
        Planner.Cookbook.getTodaysRecipe(Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/tasks") {
        if (parsedUrl.query.priority != undefined) {
            Planner.Todo.readTaskEntries(Number(parsedUrl.query.priority), Planner.writeJson(response));
        } else if (parsedUrl.query.recurrence != undefined) {
            Planner.Todo.readRecurringTaskEntries(parsedUrl.query.recurrence, Planner.writeJson(response));
        } 
    } else if (parsedUrl.pathname == "/completeTask") {
        Planner.Todo.updateTaskDone(parsedUrl.query.task, parsedUrl.query.done, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/saveTask") {
        Planner.Todo.saveTask(parsedUrl.query.description, parsedUrl.query.responsible, parsedUrl.query.recurrence, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/prioritizeTask") {
        Planner.Todo.prioritizeTask(parsedUrl.query.task, Number(parsedUrl.query.priority), Planner.writeJson(response));
    } 
    else if (parsedUrl.pathname == "/updateDay") {
        var chunk = '';
        request.on('data', function (data) {
            chunk += data;
        });
        request.on('end', function () {
            Planner.Calendar.updateDay(Number(parsedUrl.query.day), Number(parsedUrl.query.month), querystring.parse(chunk), Planner.writeJson(response));
        });
    } else if (parsedUrl.pathname == "/createRecipe") {
        var chunk = '';
        request.on('data', function (data) {
            chunk += data;
        });
        request.on('end', function () {
            Planner.Cookbook.updateRecipe(JSON.parse(chunk), Planner.writeJson(response));
        });
    } else if (parsedUrl.pathname == "/deleteRecipe") {
        var chunk = '';
        request.on('data', function (data) {
            chunk += data;
        });
        request.on('end', function () {
            Planner.Cookbook.deleteRecipe(JSON.parse(chunk), Planner.writeJson(response));
        });
    } else if (parsedUrl.pathname == "/allRecipesDb") {
        Planner.Cookbook.getRecipesDb(Planner.writeJson(response));
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
server.listen(port);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:"+port);

Planner.writeJson = function(response) {
    return function(data) {
        response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
        response.end(JSON.stringify(data), 'utf-8');          
    }
}



 