/**
 * Module dependencies.
 */

var express = require('express'), 
    cons = require('consolidate'), 
    swig = require('swig'), 
    stylus = require('stylus'),
    nib = require('nib'), 
    http = require('http'), 
    path = require('path'), 
    sockIO = require('socket.io');

var app = express();
var server = http.createServer(app);
var websock = sockIO.listen(server);
var nicknameMap = {}, nicknameList=[];
global.expressApp = app;

app.set('port', process.env.PORT || 3000);
swig.init({
    root : __dirname + '/views',
    allowErrors : true, // allows errors to be thrown and caught by express instead of suppressed by Swig
    cache : ('development' != app.get('env')) // if false, always reload template files
});

/**
* CORS support.
*/

app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});    
    

app.configure(function() {
    'use strict';
    app.set('views', __dirname + '/views');
    app.engine('.html', cons.swig);
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    //app.use(express.bodyParser());
    //app.use(express.methodOverride());
    app.use(app.router);
    app.use(stylus.middleware({
        src : __dirname + '/public',
        compile : function(str, path) {
            return stylus(str).set('filename', path).set('compress', true).use(nib());
        }
    }));
    app.use(express.static(path.join(__dirname, 'public')));
});

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

require('./routes');

/* set the port used to probe for checking if flash sockets should be enabled */
websock.set('flash policy port', 10843); // not actually used, because flash disabled 
/*
 * htmlfile and flashsocket are removed because they were causing long startup
 * delays in IE 9. 
 */
websock.set('transports',['websocket', 'xhr-polling', 'jsonp-polling']); 
websock.sockets.on('connection', function(socket) {
    'use strict';
    var nickname='';
    socket.on('nickname', function(name, ack) {
        console.log('Got set nickname request for name '+name);
        if(name in nicknameMap){
            if(typeof(ack)=='function'){
                ack(true);
            }
        }
        else{
            nicknameMap[name] = socket;
            nicknameList = Object.keys(nicknameMap); 
            nickname = name;
            if(typeof(ack)=='function'){
                ack(false);
            }
            process.nextTick(function(){
                websock.sockets.emit('announcement', name+' has connected');
                websock.sockets.emit('nicknames', nicknameList);
            });
        }
    });
    socket.on('usermessage', function(msg) {
        process.nextTick(function(){
            websock.sockets.clients().forEach(function (sock) {
                if(sock!=socket){
                    sock.emit('msg_to_room',nickname,msg);
                } 
            });
        });
    });    
    socket.on('disconnect', function() {
        var gone=null, name;
        for(name in nicknameMap){
            if(nicknameMap[name]==socket){
                delete nicknameMap[name];
                nicknameList = Object.keys(nicknameMap); 
                gone = name;
            }
        }
        if(gone!==null){
            process.nextTick(function(){
                websock.sockets.emit('announcement', gone+' has disconnected');
                websock.sockets.emit('nicknames', nicknameList);
            });
        }
    });
});

server.listen(app.get('port'), function() {'use strict';
    console.log('Express server listening on port ' + app.get('port'));
});
