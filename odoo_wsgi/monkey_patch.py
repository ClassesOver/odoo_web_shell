# -*- coding: utf-8 -*-
_after_commit_callbacks = []
def monkey_patch():
    import odoo
    
    _Cursor = odoo.sql_db.Cursor

    class Cursor(_Cursor):
        
        def __init__(self, pool, dbname, dsn, serialized=True):
            self.operations = []
            super(Cursor, self).__init__(pool, dbname, dsn, serialized=serialized)
        
        @odoo.sql_db.check
        def commit(self):
            rt = super(Cursor, self).commit()
            for cb in _after_commit_callbacks:
                cb(self.operations)
            self.operations = []
            return rt
        
        @classmethod
        def after_commit_callback(cls, fn):
            _after_commit_callbacks.append(fn)
    
    odoo.sql_db.Cursor = Cursor
    
    

