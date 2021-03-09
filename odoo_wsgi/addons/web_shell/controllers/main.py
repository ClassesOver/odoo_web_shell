# -*- coding: utf-8 -*-
import socketio
import signal
import psutil
import os
from ..worker import WorkerManager
import datetime
import json
from odoo_wsgi.dispatch import dispatch

try:
    from json.decoder import JSONDecodeError
except ImportError:
    JSONDecodeError = ValueError
shells = {}
SHELL_KEY = 'shell_id'
SESSION_KEY = 'session_id'
DISCONNECT_TIMEOUT = 15 * 60;
async_mode = 'eventlet'
alive = False


class SocketIOServer(socketio.Server):
    def __init__(self, *args, **kwargs):
        super(SocketIOServer, self).__init__(*args, **kwargs)
        self.signal_handler = SignalHandler(self.auto_disconnect)
        self._signal_handler_callback = self.auto_disconnect
    
    def auto_disconnect(self, sid, *args, **kwargs):
        self.disconnect(sid)
    
    def signal_handler_callback(self, func):
        self._signal_handler_callback = func


class SignalHandler(object):
    def __init__(self, ignore_callback=None):
        self.SIGINT = False
        self.ignore_callback = ignore_callback or (lambda: None)
    
    def signal_handler(self, sig, frame):
        self.SIGINT = True
        os.kill(os.getpid(), signal.SIGKILL)
    
    def ignore(self, func):
        def fn(*args, **kwargs):
            if self.SIGINT:
                return self.ignore_callback(*args, **kwargs)
            return func(*args, **kwargs)
        
        return fn


infos = []
sio = SocketIOServer(logger=True, async_mode=async_mode, always_connect=True)
worker_manager = WorkerManager(socket_io=sio)
handler = sio.signal_handler


def start_new(ip, uuid=False, sid=None, db_name=None, uid=None):
    worker = worker_manager(ip, uuid, db_name, uid)
    worker.set_sid(sid)
    worker.load()
    return worker.id, worker


def server_info():
    while True:
        sio.sleep(1)
        memory_info = psutil.virtual_memory()
        data = {}
        try:
            for k, v in shells.items():
                data[k] = psutil.Process(v.pid).memory_info()
            now = datetime.datetime.now()
            info = {'shells_count': len(shells),
                    'total'       : memory_info.total,
                    'percent'     : memory_info.percent,
                    'shells'      : data,
                    'cpu_percent' : psutil.cpu_percent(interval=1),
                    'cpu'         : psutil.cpu_count(),
                    'time'        : now.strftime('%Y-%m-%d %H:%M:%S')}
            if len(infos) >= 60:
                infos.pop(0)
            infos.append(info)
            sio.emit('server_info', {'info': info, 'infos': infos})
        
        except RuntimeError:
            pass

@dispatch.register('commit')
def handle_commit(ops):
    for op in ops:
        sio.emit('commit', json.dumps(op) )


@handler.ignore
@sio.event
def stdout(sid, *args):
    pass


@handler.ignore
@sio.event
def open(sid):
    return sio.emit('open', room=sid)


@handler.ignore
@sio.event
def message(sid, msg=None):
    with sio.session(sid) as session:
        if msg:
            msg = json.loads(msg)
            ip = session.get('ip') or msg['ip']
            worker = session.get('worker', False)
            if not worker:
                worker = worker_manager.get(ip, uuid=msg['http_session_id'])
            if worker:
                if msg.get('method') == 'execute':
                    data = msg['data']
                    if data == "?":
                        worker.on_send(sid, data, end='')
                    else:
                        worker.on_send(sid, data)
            
@sio.on('connect')
def connect(sid, environ):
    with sio.session(sid) as session:
        session['ip'] = get_client_ip(environ)
        sio.emit('open', room=sid)
    

def get_client_ip(environ):
    if environ.get('HTTP_X_FORWARDED_FOR') is not None:
        ip = environ.get('HTTP_X_FORWARDED_FOR')
    else:
        ip = environ.get('REMOTE_ADDR')
    return ip

signal.signal(signal.SIGINT, handler.signal_handler)
