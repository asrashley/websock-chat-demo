Cross-platform Websock demo
---------------------------
This is a very simple chat application using [socket.io][sockio] to perform the connection
between client browser and the server.

  [sockio]: https://github.com/learnboost/socket.io/
    
There are two server implementations, one written in node.js JavaScript and 
the other written in Python.

node.js server
--------------
Assuming you have already installed node.js and npm, the other required
libraries can be installed automatically by npm:

    npm install -d
    
The web server is based upon the [express][expressjs] middleware, the 
[Swig template engine][swig] and the [Stylus CSS template engine][stylus]. To
avoid having to write all those vendor prefixes (keeping it DRY) the
[nib stylus plugin][nib] is used.

  [expressjs]: http://expressjs.com/
  [swig]: http://paularmstrong.github.io/swig/
  [stylus]: http://learnboost.github.io/stylus/
  [nib]: https://github.com/visionmedia/nib/
   
   
Starting the app with

    node app.js
    
should create an HTTP server on localhost:3000

Python server
-------------
The Python server uses the python port of [socket.io] [pysock] to provide the
server side implementation. The python port of socket.io uses [gevent][gevent],
which has a [Windows installer][gevent-win] for those of us unfortunate enough
to have to use Windows. 

  [pysock]: https://github.com/abourget/gevent-socketio
  [gevent]: http://www.gevent.org/ "The gevent coroutine-based Python networking library"
  [gevent-win]: https://pypi.python.org/packages/2.7/g/gevent/gevent-0.13.8.win32-py2.7.msi

Starting the app with:

    python chat.py
    
should create an HTTP server on localhost:3000

The CSS files are auto-generated from Stylus templates when using the node.js
server, but are *not* auto-generated when using Python. You will need to use the
node.js server at least once (and visit <http://localhost:3000/>) after cloning
the repo or after changing the Stylus templates.

Client application
------------------
The client application is a simple HTML5 + JavaScript web application. It
allows a user to choose a user name and log in to a chat room. Once logged in,
messages can be sent to all users in the chat room.

The client application has been tested with IE9, Firefox 20 and Chrome 26 for
Windows and Chrome 26 for Android. Websockets have been supported natively since
Safari 5.0 and iOS 4.2, so it should work on Mac and iDevices.
