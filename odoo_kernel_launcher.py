# -*- coding: utf-8 -*-
import sys



if __name__ == '__main__':
    
    if sys.path[0] == '':
        del sys.path[0]
    args = sys.argv[3:]
    sys.argv = sys.argv[0:3]
    from odoo_wsgi import odoo
    
    if len(args) > 1 and args[0].startswith('--addons-path=') and not args[1].startswith("-"):
        odoo.tools.config._parse_config([args[0]])
        args = args[1:]
    from odoo_wsgi import launch_new_instance

    sys.exit(launch_new_instance(args))
