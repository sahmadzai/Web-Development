/**
 * Siraj Ahmadzai
 Student ID: 101040544
 Course: COMP 2406
 Assignment 4
 Date: 2016/11/21
 */

/*SocketIO based chat room. Extended to not echo messages
 to the client that sent them.*/

var http = require('http').createServer(handleRequest);
var io = require('socket.io')(http);
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
var qs = require('querystring');
const ROOT = "./public_html";

http.listen(2406);

console.log("Chat server listening on port 2406");


function handleRequest(req, res) {

    //process the request
    console.log(req.method + " request for: " + req.url);

    //parse the url
    var urlObj = url.parse(req.url, true);
    var filePath = ROOT + urlObj.pathname;

    //ROUTES
    if (urlObj.pathname === "RoutePath") {
        //Fake route to easily be able to add dynamic paths in the future
        serve404();
    }
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
        //serves 404 file
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


var clients = [];


io.on("connection", function (socket) {
    console.log("Got a connection");

    socket.on("intro", function (data) {
        socket.username = data;
        socket.broadcast.emit("message", timestamp() + ": " + socket.username + " has entered the chatroom.");
        socket.emit("message", "Welcome, " + socket.username + ".");

        //add blocked userlist to each new socket
        socket.blockedUsers = [];
        socket.hasBlockedUser  = function (username) {
            // var index = this.blockedUsers.indexOf(username);
            // if(index === -1)
            // {
            //     return false;
            // }
            // else
            // {
            //     return true;
            // }
            return this.blockedUsers.indexOf(username) !== -1;
        };

        clients.push(socket);
        var userList = {users: getUserList()};
        io.emit("userList", userList);
    });

    socket.on("message", function (data) {
        console.log("got message: " + data);
        // socket.broadcast.emit("message", timestamp() + ", " + socket.username + ": " + data);
        var friendlyClients = [];

        //build the list
        for(var i = 0; i < clients.length; i++)
        {
            if(!clients[i].hasBlockedUser(socket.username) && clients[i] !== socket)
            {
                friendlyClients.push(clients[i]);
            }
        }

        //emit to friendly clients
        for(var j = 0; j<friendlyClients.length; j++)
        {
            friendlyClients[j].emit("message", timestamp() + ", " + socket.username + ": " + data);
        }

    });

    socket.on("disconnect", function () {
        console.log(socket.username + " disconnected");
        io.emit("message", timestamp() + ": " + socket.username + " disconnected.");
        clients = clients.filter(function (ele) {
            return ele !== socket;
        });

        var userList = {users: getUserList()};
        io.emit("userList", userList);
    });

    socket.on("privateMessage", function (data) {
        var receiver = findClientByUsername(data.username);
        var index = socket.blockedUsers.indexOf(data.username);
        console.log(socket.username);
        if(data.username !== socket.username) {
            if (!receiver.hasBlockedUser(socket.username)) {
                console.log("got private message:" + data.message);
                receiver.emit("message", timestamp() + ", Private Message from " + socket.username + ": " + data.message);
            }
            else {
                console.log("blocked private message:" + data.message);
            }
        }
        else
        {
            console.log("Not allowed to Private Message yourself");
        }
    });

    socket.on("blockUser", function (data) {
        var index = socket.blockedUsers.indexOf(data.username);
        console.log(socket.username);
        if(data.username === socket.username){
            console.log("Not allowed to block yourself");
        }
        else if(index === -1)
        {
            socket.blockedUsers.push(data.username);
            console.log("got username to block: " + data.username);
            socket.emit("message", "Blocked " + data.username);
        }
        else
        {
            socket.blockedUsers.pop(data.username);
            console.log("got username unblock: " + data.username);
            socket.emit("message", "Unblocked " + data.username);
        }
    });


});
/**
 * returns local time
 * @returns {string}
 */
function timestamp() {
    return new Date().toLocaleTimeString();
}
/**
 * gets list of users
 * @returns {Array}
 */
function getUserList() {
    var ret = [];
    for (var i = 0; i < clients.length; i++) {
        ret.push(clients[i].username);
    }
    return ret;
}
/**
 * Finds the clients by user name and fills the list of clients
 * @param username
 * @returns {*}
 */
function findClientByUsername(username) {
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].username === username) {
            return clients[i];
        }
    }
    return false;
}