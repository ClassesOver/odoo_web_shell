# -*- coding: utf-8 -*-

from odoo import models, api
from ..controllers.main import start_new, SESSION_KEY
from odoo.http import request

from odoo import models, api

if not hasattr(api, 'multi'):
    def multi(fn):
        return fn
    
    
    api.multi = multi


class Base(models.AbstractModel):
    _inherit = 'base'
    
    @api.multi
    def write(self, values):
        if hasattr(self.env.cr, 'operations'):
            self.env.cr.operations.append((self._name, 'write', self.ids))
        else:
            self.env.cr.operations = []
            self.env.cr.operations.append((self._name, 'write', self.ids))
        return super(Base, self).write(values)
    
    @api.model
    def create(self, values):
        if hasattr(self.env.cr, 'operations'):
            self.env.cr.operations.append((self._name, 'create', []))
        else:
            self.env.cr.operations = []
            self.env.cr.operations.append((self._name, 'create', []))
        return super(Base, self).create(values)
    
    @api.multi
    def unlink(self):
        if hasattr(self.env.cr, 'operations'):
            self.env.cr.operations.append((self._name, 'unlink', self.ids))
        else:
            self.env.cr.operations = []
            self.env.cr.operations.append((self._name, 'unlink', self.ids))
        
        return super(Base, self).unlink()


class WebTerminal(models.Model):
    _name = 'web.terminal'
    _description = 'Web terminal'
    
    @api.model
    def show_banner(self):
        session_id = request.httprequest.cookies.get(SESSION_KEY, False)
        uuid = session_id
        ip = request.httprequest.remote_addr
        uid = request.uid
        db = request.db
        _, worker = start_new(ip, uuid, sid=None, db_name=db, uid=uid)
        banner = worker.show_banner()
        if worker.app.alive():
            worker.app.restart_kernel()
        return {'banner'    : banner.split('\n'),
                'exec_count': worker.shell.execution_count,
                'ip'        : ip,
                'uuid'      : uuid}
