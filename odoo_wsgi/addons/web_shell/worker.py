# -*- coding: utf-8 -*-
import logging
import signal
from .ipt import App

BUF_SIZE = 32 * 1024
clients = {}  # {ip: {id: worker}}


class WorkerManager(object):
    
    def __init__(self, socket_io):
        super(WorkerManager, self).__init__()
        self.socket_io = socket_io

    def __call__(self, ip, uuid, db_name, uid):
        workers = clients.get(ip, {})
        worker = workers.get(uuid, False)
        if not worker:
            worker = Worker(socket_io=self.socket_io, uuid=uuid, db_name=db_name, uid=uid)
            workers[uuid] = worker
        clients[ip] = workers
        return worker

    @staticmethod
    def get(ip, uuid):
        return clients.get(ip, {}) and clients.get(ip, {}).get(uuid, False)


def clear_worker(worker, clients):
    ip = worker.src_addr[0]
    workers = clients.get(ip)
    assert worker.id in workers
    workers.pop(worker.id)
    
    if not workers:
        clients.pop(ip)
        if not clients:
            clients.clear()


def recycle_worker(worker):
    if worker.handler:
        return
    logging.warning('Recycling worker {}'.format(worker.id))
    worker.close(reason='worker recycled')


class Worker(object):
    def __init__(self, socket_io=None, uuid=False, db_name=False, uid=False):
        self.id = str(id(self))
        self.handler = None
        self.closed = False
        self._db = None
        self._uid = None
        self.socket_io = socket_io
        self.sid = None
        self.uuid = uuid
        self._app = App(worker=self)
        self._app.initialize(db_name, uid)
        self.shell = self._app.shell
    
    @property
    def app(self):
        return self._app
    
    @property
    def db(self):
        return self._db
    
    @property
    def uid(self):
        return self._uid
    
    def set_uid(self, uid):
        self._uid = uid
        self._app.uid = uid
    
    def set_db(self, db_name):
        self._db = db_name
        self._app.db_name = db_name
    
    def set_sid(self, sid):
        self.sid = sid
    
    def send(self, data):
        self.socket_io.emit('message', data, room=self.sid)
    
    def load(self):
        if self.closed:
            return
    
    def show_banner(self):
        return self.shell.show_banner()
    
    def on_send(self, sid=None, data='', end='\r\n'):
        if not self.sid and sid:
            self.sid = sid
        logging.debug('worker {} on write'.format(self.id))
        if not data:
            return
        try:
            code = data + end
            reply = self.shell.run_cell(code, store_history=True)
            execution_count = self.shell.execution_count
            lines = reply.split('\n')
            for l in lines:
                msg = l.strip()
                self.socket_io.emit('message', {'data': msg, 'exec_count': execution_count}, room=sid or self.sid)
            self.socket_io.emit('prompt_for_code', room=sid or self.sid)
        except (OSError, IOError) as e:
            pass
    
    def close(self, reason=None):
        if self.closed:
            return
        self.closed = True
        
        logging.info(
            'Closing worker {} with reason: {}'.format(self.id, reason)
        )
        clear_worker(self, clients)
        logging.debug(clients)
