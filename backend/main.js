var Planner = {};

process.env = process.env || {};
var port = process.env.PORT || 8000;

var http = require('http');
var fs = require('fs');
var url = require("url");
var google = require('googleapis');
var querystring = require("querystring");

Planner.Sheets = require(process.cwd() + '/backend/sheets.js');
Planner.oauth2Client = new google.auth.OAuth2('325419649433-mlppjiobg9i3p9aol2ediptkl72chfs5.apps.googleusercontent.com', 'zJlcxM8eOD6WKEiEQvYoTuHr', 'http://localhost:8000/oauth2callback');

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
            Planner.Sheets.setupMonths(session);
            setTimeout(function() {
                response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
                response.setHeader('location', "/");
                response.writeHead(302);
                response.end();
            }, 10000);
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
        Planner.Sheets.getToday(session, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/week") {
        var date = parsedUrl.query.startDate != undefined ? parsedUrl.query.startDate : new Date(); 
        Planner.Sheets.getWeek(date, session, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/recipe") {
        Planner.Sheets.getTodaysRecipe(session, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/tasks") {
        Planner.Sheets.getPlannedTasks(session, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/completeTask") {
        Planner.Sheets.setCompletedTask(session, parsedUrl.query.task, Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/calendar") {
        Planner.Sheets.getCalendar(session, Number(parsedUrl.query.month), Planner.writeJson(response));
    } else if (parsedUrl.pathname == "/updateDay") {
        var chunk = '';
        request.on('data', function (data) {
            chunk += data;
        });
        request.on('end', function () {
            Planner.Sheets.updateDay(session, Number(parsedUrl.query.day), parsedUrl.query.month, querystring.parse(chunk), Planner.writeJson(response));
        });
    } else if (parsedUrl.pathname == "/recipes") {
        Planner.Sheets.getRecipes(session, Planner.writeJson(response));
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



 