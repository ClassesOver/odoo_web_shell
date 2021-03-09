# -*- coding: utf-8 -*-
# For generic wsgi handlers a global application is defined.
# For uwsgi this should work:
#   $ uwsgi_python --http :9090 --pythonpath . --wsgi-file openerp-wsgi.py
#
# For gunicorn additional globals need to be defined in the Gunicorn section.
# Then the following command should run:
#   $ gunicorn odoo:service.wsgi_server.application -c openerp-wsgi.py

from odoo_wsgi import odoo
from odoo_wsgi import check_root_user, check_postgres_user, report_configuration, setup_pid_file, \
    preload_registries
import socketio
import os
import sys
import csv
from psycopg2 import ProgrammingError, errorcodes
import socket
import platform
import errno

addon_path = os.path.normcase(os.path.abspath(os.path.join(os.path.dirname(__file__), 'addons')))
if addon_path not in odoo.addons.__path__:
    odoo.addons.__path__.append(addon_path)


class Server(object):
    def __init__(self):
        self.app = None
        config = odoo.tools.config
        # config
        self.interface = config['http_interface'] or '0.0.0.0'
        self.port = config['http_port']
        # runtime
        self.pid = os.getpid()
    
    def close_socket(self, sock):
        """ Closes a socket instance cleanly
        :param sock: the network socket to close
        :type sock: socket.socket
        """
        try:
            sock.shutdown(socket.SHUT_RDWR)
        except socket.error as e:
            if e.errno == errno.EBADF:
                return
            if e.errno != errno.ENOTCONN or platform.system() not in ['Darwin', 'Windows']:
                raise
        sock.close()
    
    @staticmethod
    def guess_addons():
        l = []
        extra_addons = os.path.join(os.path.dirname(os.path.dirname(odoo.__file__)), 'addons')
        # addons = os.path.join(os.path.dirname(odoo.__file__), 'addons')
        # if os.path.exists(addons):
        #     l.append(addons)
        if os.path.exists(extra_addons):
            l.append(extra_addons)
        l.append(os.path.join(os.path.dirname(__file__), 'addons'))
        return ','.join(l)
    
    def run(self, preload):
        
        addons_str = odoo.tools.config['addons_path']
        guess_addons_str = self.guess_addons()
        odoo.tools.config['addons_path'] = addons_str + ',' + guess_addons_str
        
        preload_registries(preload)
        
        # ----------------------------------------------------------
        # Common
        # ----------------------------------------------------------
        odoo.multi_process = True
        odoo.service.server.load_server_wide_modules()
        
        from odoo.addons.web_shell.controllers import sio, async_mode
        
        # ----------------------------------------------------------
        # Generic WSGI handlers application
        # ----------------------------------------------------------
        application = odoo.service.wsgi_server.application
        
        middleware = socketio.WSGIApp(sio, application)
        
        odoo.service.wsgi_server.application = middleware
        
        self.app = middleware
    
    def start(self, preload, mode='eventlet', load=[]):
        if load:
            odoo.conf.server_wide_modules = ['base', 'web'] + load
        self.run(preload)
        if mode == 'gevent':
            from gevent import pywsgi
            from geventwebsocket.handler import WebSocketHandler
            
            pywsgi.WSGIServer(('', self.port), odoo.service.wsgi_server.application,
                              handler_class=WebSocketHandler).serve_forever()
        
        else:
            import eventlet
            
            eventlet.wsgi.server(eventlet.listen(('', self.port)), odoo.service.wsgi_server.application)


def main(args):
    check_root_user()
    odoo.tools.config.parse_config(args)
    check_postgres_user()
    report_configuration()
    
    config = odoo.tools.config
    
    # the default limit for CSV fields in the module is 128KiB, which is not
    # quite sufficient to import images to store in attachment. 500MiB is a
    # bit overkill, but better safe than sorry I guess
    csv.field_size_limit(500 * 1024 * 1024)
    
    preload = []
    if config['db_name']:
        preload = config['db_name'].split(',')
        for db_name in preload:
            try:
                odoo.service.db._create_empty_database(db_name)
                config['init']['base'] = True
            except ProgrammingError as err:
                if err.pgcode == errorcodes.INSUFFICIENT_PRIVILEGE:
                    pass
                else:
                    raise err
            except odoo.service.db.DatabaseExists:
                pass
    
    if config['workers']:
        odoo.multi_process = True
    
    setup_pid_file()
    
    server = Server()
    sys.exit(server.start(preload, load=['web_shell']))


def serve_forever():
    args = sys.argv[1:]
    
    if len(args) > 1 and args[0].startswith('--addons-path=') and not args[1].startswith("-"):
        odoo.tools.config._parse_config([args[0]])
        args = args[1:]
    
    main(args)


if __name__ == '__main__':
    sys.exit(serve_forever())
