from gevent import monkey; monkey.patch_all()

from socketio import socketio_manage
from socketio.server import SocketIOServer
from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin

import os, re

class ChatNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    def on_nickname(self, nickname):
        print('Got set nickname request for '+nickname)
        self.request['nicknames'].append(nickname)
        self.socket.session['nickname'] = nickname
        self.broadcast_event('announcement', '%s has connected' % nickname)
        self.broadcast_event('nicknames', self.request['nicknames'])
        #self.emit('setnickname',True)
        # Just have them join a default-named room
        self.join('main_room')

    def recv_disconnect(self):
        # Remove nickname from the list.
        try:
            nickname = self.socket.session['nickname']
            self.request['nicknames'].remove(nickname)
            self.broadcast_event('announcement', '%s has disconnected' % nickname)
            self.broadcast_event('nicknames', self.request['nicknames'])
        except KeyError:
            pass
        self.disconnect(silent=True)

    def on_usermessage(self, msg):
        self.emit_to_room('main_room', 'msg_to_room',
            self.socket.session['nickname'], msg)
        
    def on_ping(self):
        print 'PING'
        
    def recv_connect(self):
        self.session['nickname'] = 'guest123'
        self.join('room1')

    def recv_message(self, message):
        print "Message:", message

class Application(object):
    def __init__(self):
        self.buffer = []
        self.request = {
            'nicknames': [],
        }

    def __call__(self, environ, start_response):
        path = environ['PATH_INFO'].strip('/')

        if not path:
            start_response('200 OK', [('Content-Type', 'text/html')])
            return ['<!DOCTYPE html><html>'
                    '<head><link rel="stylesheet" href="/css/main.css"></head>'
                    '<body><h1 class="title">Welcome. '
                'Try the <a href="/chat.html">chat</a> example.</h1>'
                '<h2>This demo is served from a <a href="http://python.org/">Python</a> server</h2>'
                '</body></html>'
                ]
            
        if path.startswith("socket.io") and not path.endswith('socket.io.js'):
            socketio_manage(environ, namespaces={'': ChatNamespace}, request=self.request)
        else:
            if path.endswith('socket.io.js'):
                path = 'js/vendor/socket.io.js'
            try:
                data = open(os.path.join('public',path)).read()
            except Exception:
                return not_found(start_response)

            if path.endswith(".js"):
                content_type = "text/javascript"
            elif path.endswith(".css"):
                content_type = "text/css"
            elif path.endswith(".swf"):
                content_type = "application/x-shockwave-flash"
            else:
                content_type = "text/html"

            start_response('200 OK', [('Content-Type', content_type)])
            return [data]
        return not_found(start_response)

def not_found(start_response):
    start_response('404 Not Found', [])
    return ['<!DOCTYPE html><html><head><title>Not found</title></head><body><h1>Not Found</h1></body></html>']


if __name__ == '__main__':
    print 'Listening on port 3000 and on port 10843 (flash policy server)'
    SocketIOServer(('0.0.0.0', 3000), Application(),
        resource="socket.io", policy_server=True,
        transports=['websocket', 'xhr-multipart', 'xhr-polling', 'jsonp-polling',],
        policy_listener=('0.0.0.0', 10843)).serve_forever()
