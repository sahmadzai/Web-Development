/**
 * Siraj Ahmadzai
 Student ID: 101040544
 Course: COMP 2406
 Assignment 3
 Date: 2016/11/13
 */

//An asynchronous server that serves static files

// load necessary modules
var makeBoard = require('./makeboard.js');
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');

var qs = require('querystring');

var users = {};

const ROOT = "./public_html";

// create http server
var server = http.createServer(handleRequest);
server.listen(2406);
console.log('Server listening on port 2406');

function handleRequest(req, res) {

    //process the request
    console.log(req.method + " request for: " + req.url);

    //parse the url
    var urlObj = url.parse(req.url, true);
    var filePath = ROOT + urlObj.pathname;

    //ROUTES
    if (urlObj.pathname === "/memory/intro") getQueryStrings(req, res, routeMemoryIntro);
    else if (urlObj.pathname === "/memory/card") getQueryStrings(req, res, routeMemoryCard);
    else {
        //        the        callback        sequence        for static serving...
        fs.stat(filePath,
            function (err, stats) {
                if (err) {   //try and open the file and handle the error, handle the error
                    respondErr(err);
                } else {
                    if (stats.isDirectory())    filePath += "/index.html";

                    fs.readFile(filePath, "utf8", function (err, data) {
                        if (err)respondErr(err);
                        else respond(200, data);
                    });
                }
            });

        //locally defined helper function
        //serves 404 files
        function serve404() {
            fs.readFile(ROOT + "/404.html", "utf8", function (err, data) { //async
                if (err)respond(500, err.message);
                else respond(404, data);
            });
        }

        //locally defined helper function
        //responds in error, and outputs to the console
        function respondErr(err) {
            console.log("Handling error: ", err);
            if (err.code === "ENOENT") {
                serve404();
            } else {
                respond(500, err.message);
            }
        }


//locally defined helper function
//sends off the response message

        function respond(code, data) {
            // content header
            res.writeHead(code, {'content-type': mime.lookup(filePath) || 'text/html'});
            // write message and signal communication is complete
            res.end(data);
        }
    }
};//end handle request

/**
 *Equivalent to respond but for non-static routes
 * @param code
 * @param data
 * @param req
 * @param res
 */
function respondDyn(code, data, req, res) {
    // content header
    res.writeHead(code, {'content-type': mime.lookup(req.url.substr(0, req.url.indexOf("?"))) || 'text/html'});
    // write message and signal communication is complete
    res.end(data);

}


function randEle(list) {
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Login
 * @param req
 * @param res
 * @param querystrings
 */
function routeMemoryIntro(req, res, querystrings) {
    var code = 200;
    var data;
    var INIT_LEVEL = 1;
    var MIN_SIZE = 4;

    users[querystrings.username] = {
        "board": makeBoard.makeBoard(MIN_SIZE),
        "level": INIT_LEVEL
    };

    data = JSON.stringify(MIN_SIZE);
    console.log(data);
    respondDyn(code, data, req, res);
}

/**
 *Returns card value of the card at "row and column" in the board
 * @param req
 * @param res
 * @param querystrings: username, row and column indexes
 */
function routeMemoryCard(req, res, querystrings) {

    var code = 200;
    var cardValue;
    var user = users[querystrings.username];

    cardValue = user.board[querystrings.row][querystrings.column];

    var data = JSON.stringify(cardValue);
    console.log(data);
    respondDyn(code, data, req, res);
}

/*function createGame(level) {
 var INIT_AMOUNT = 2;
 var amount = INIT_AMOUNT + level;
 var colours = hexcodes.makeColorList(amount);
 var game = {
 "colours": colours,
 "question": colours[Math.floor((Math.random() * amount))],
 "level": level
 };
 return game;
 }*/

/**
 *builds the querystrings object and calls a route callback
 * @param req
 * @param res
 * @param routeCallback
 */
function getQueryStrings(req, res, routeCallback) {
    var body = "";
    req.on("data", function (data) {
        body += data;
    });

    req.on('end', function () {
        //can use a loop instead if modules are not allowed
        var querystrings = qs.parse(body);
        console.log("POST:");
        console.log(querystrings);
        if (req.url.indexOf("?") !== -1) {
            var tempGet = qs.parse(req.url.substr(req.url.indexOf("?") + 1, req.url.length - 1));
            /*Combining querystring with tempGet (combining get data with post data) */
            for (var attrname in tempGet) {
                querystrings[attrname] = tempGet[attrname];
            }

            console.log("GET:");
            console.log(tempGet);
        }
        routeCallback(req, res, querystrings);
    });
}
