window.WEB_SOCKET_SWF_LOCATION = "/bin/WebSocketMain.swf";
window.WEB_SOCKET_DEBUG = true;

$(document).ready(function() {
    'use strict';
    var socket = io.connect(location.protocol+'//'+location.host, { 'flash policy port':10843 });

    $(window).bind("beforeunload", function() {
        socket.disconnect();
    });

    socket.on('connect', function() {
        $('#chat').addClass('connected');
        socket.emit('ping');
    });
    
    socket.on('connect_failed', function() {
        $('#connect-err').css('visibility', 'visible');
        console.log('Connection failed');
    });

    socket.on('announcement', function(msg) {
        $('#lines').append($('<p>').append($('<em>').text(msg)));
    });

    socket.on('nicknames', function(nicknames) {
        $('#nicknames').empty().append($('<span>Online: </span>'));
        for (var i in nicknames) {
            $('#nicknames').append($('<b>').text(nicknames[i]));
        }
    });

    socket.on('msg_to_room', message);

    socket.on('reconnect', function() {
        $('#lines').remove();
        message('System', 'Reconnected to the server');
    });

    socket.on('reconnecting', function() {
        message('System', 'Attempting to re-connect to the server');
    });

    socket.on('error', function(e) {
        message('System', e ? e : 'A unknown error occurred');
    });

    socket.on('setnickname', function(ack){
        console.log('done setting nickname '+ack);
        if (ack) {
                clear();
                $('#chat').addClass('nicknameset');
        }
        else{
                $('#nickname-err').css('visibility', 'visible');
        }
    });
    
    function message(from, msg) {
        $('#lines').append($('<p>').append($('<span>', {'class':'from'}).text(from), msg));
    }


    $('#set-nickname').submit(function(ev) {
        console.log('set nickname '+$('#nick').val());
            $('#nickname-err').css('visibility', 'hidden');
        socket.emit('nickname', $('#nick').val() , function(set) {
            console.log('done setting nickname');
            if (!set) {
                clear();
                return $('#chat').addClass('nicknameset');
            }
            $('#nickname-err').css('visibility', 'visible');
        });
        return false;
    });

    $('#send-message').submit(function() {
        message('me', $('#message').val());
        socket.emit('usermessage', $('#message').val());
        clear();
        $('#lines').get(0).scrollTop = 10000000;
        return false;
    });

    function clear() {
        $('#message').val('').focus();
    }
});
