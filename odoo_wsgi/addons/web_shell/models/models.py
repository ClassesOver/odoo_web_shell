# -*- coding: utf-8 -*-

from odoo import models, api
from ..controllers.main import start_new, SESSION_KEY, SHELL_KEY
from odoo.http import request


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
