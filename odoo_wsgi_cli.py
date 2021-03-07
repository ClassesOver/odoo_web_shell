# -*- coding: utf-8 -*-
import sys
from odoo_wsgi import wsgi_server

if __name__ == '__main__':
    sys.exit(wsgi_server.serve_forever())
