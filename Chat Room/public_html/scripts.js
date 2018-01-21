
 /* ready event is fired when the document is fully loaded
 */
$(document).ready(function() {

    var userName = prompt("What's your name?") || "User";

    var socket = io(); //connect to the server that sent this page
    socket.on('connect', function() {
        socket.emit("intro", userName);
    });

    $('#inputText').keypress(function(ev) {
        if (ev.which === 13) {
            //send message
            socket.emit("message", $(this).val());
            ev.preventDefault(); //if any
            $("#chatLog").append((new Date()).toLocaleTimeString() + ", " + userName + ": " + $(this).val() + "\n")
            $(this).val(""); //empty the input
        }
    });

    socket.on("message", function(data) {
        $("#chatLog").append(data + "\n");
        $('#chatLog')[0].scrollTop = $('#chatLog')[0].scrollHeight; //scroll to the bottom
    });

    socket.on("userList", function(data) {
        $('#userList').empty();
        for (var i = 0; i < data.users.length; i++) {
            $('#userList').append('<li>' + data.users[i] + '</li>');
        }
        $("li").dblclick(function (event) {
            var message;
            //block the user if ctrl key is pressed while double clicking
            if(event.ctrlKey){
                socket.emit("blockUser", { username: $(this).text() } );
            }
            //send a private message if the user is double clicked without holding ctrl key
            else{
                do
                {
                    message = prompt("Enter a message for user " + $(this).text() + ":");

                    if(message === "")
                    {
                        alert("Invalid Message!");
                    }
                }while(message === "");

                socket.emit("privateMessage",{
                    username: $(this).text(),
                    message: message
                });
            }
        });
    });
});
