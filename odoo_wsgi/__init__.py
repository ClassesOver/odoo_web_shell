# # -*- coding: utf-8 -*-
import sys
from importlib.machinery import PathFinder
import os
from ipykernel.kernelapp import IPKernelApp
from os.path import join, dirname
from dotenv import load_dotenv
import atexit
import logging

# Also use the `odoo` logger for the main script.
_logger = logging.getLogger('odoo')
env_path = join(dirname(__file__), '.env')
load_dotenv(env_path)


def is_namespace(mod):
    if hasattr(mod, "__path__") and getattr(mod, '__file__', None) is None:
        return True
    else:
        return False


def find_and_load_module(modname, modpath):
    if modname in sys.modules:
        return sys.modules[modname]
    module = None
    module_spec = PathFinder.find_spec(modname, modpath)
    if module_spec:
        loader = module_spec.loader
        module = loader.load_module()
        sys.modules[modname] = module
    return module


if os.environ.get('ODOO_HOME', False):
    opath = os.environ.get('ODOO_HOME')
    odoo = find_and_load_module('odoo', [opath])
else:
    try:
        import odoo
        
        if is_namespace(odoo):
            raise ModuleNotFoundError
    except ModuleNotFoundError:
        raise ImportError('odoo is not available.')





def launch_new_instance(args, argv=[], **kw):
    from odoo_wsgi.monkey_patch import monkey_patch
    from odoo_wsgi.dispatch import dispatch
    monkey_patch()
    check_root_user()
    odoo.tools.config.parse_config(args)
    check_postgres_user()
    report_configuration()
    odoo.conf.server_wide_modules = ['base', 'web']

    odoo.service.server.load_server_wide_modules()
    db_name = odoo.tools.config['db_name']
    with odoo.api.Environment.manage():
        local_vars = {
            'openerp': odoo,
            'odoo'   : odoo,
        }
        if db_name:
            rty = odoo.registry(db_name)
            cr = rty.cursor()
            @cr.after_commit_callback
            def after_commit(ops):
                dispatch(('commit', ops))
                
            uid = odoo.SUPERUSER_ID
            ctx = odoo.api.Environment(cr, uid, {})['res.users'].context_get()
            env = odoo.api.Environment(cr, uid, ctx)
            local_vars['env'] = env
            local_vars['self'] = env.user
        
        IPKernelApp.launch_instance(user_ns=local_vars)


def check_root_user():
    """Warn if the process's user is 'root' (on POSIX system)."""
    if os.name == 'posix':
        import getpass
        if getpass.getuser() == 'root':
            sys.stderr.write("Running as user 'root' is a security risk.\n")


def check_postgres_user():
    """ Exit if the configured database user is 'postgres'.

    This function assumes the configuration has been initialized.
    """
    config = odoo.tools.config
    if (config['db_user'] or os.environ.get('PGUSER')) == 'postgres':
        sys.stderr.write("Using the database user 'postgres' is a security risk, aborting.")
        sys.exit(1)


def report_configuration():
    """ Log the server version and some configuration values.

    This function assumes the configuration has been initialized.
    """
    __version__ = odoo.release.version
    config = odoo.tools.config
    _logger.info("Odoo version %s", __version__)
    if os.path.isfile(config.rcfile):
        _logger.info("Using configuration file at " + config.rcfile)
    _logger.info('addons paths: %s', odoo.addons.__path__)
    if config.get('upgrade_path'):
        _logger.info('upgrade path: %s', config['upgrade_path'])
    host = config['db_host'] or os.environ.get('PGHOST', 'default')
    port = config['db_port'] or os.environ.get('PGPORT', 'default')
    user = config['db_user'] or os.environ.get('PGUSER', 'default')
    _logger.info('database: %s@%s:%s', user, host, port)


def rm_pid_file(main_pid):
    config = odoo.tools.config
    if config['pidfile'] and main_pid == os.getpid():
        try:
            os.unlink(config['pidfile'])
        except OSError:
            pass


def setup_pid_file():
    """ Create a file with the process id written in it.

    This function assumes the configuration has been initialized.
    """
    config = odoo.tools.config
    if not odoo.evented and config['pidfile']:
        pid = os.getpid()
        with open(config['pidfile'], 'w') as fd:
            fd.write(str(pid))
        atexit.register(rm_pid_file, pid)


registry = __import__('odoo.modules.registry', fromlist=('Registry'))
Registry = registry.Registry


def preload_registries(dbnames):
    """ Preload a registries, possibly run a test file."""
    # TODO: move all config checks to args dont check tools.config here
    config = odoo.tools.config
    dbnames = dbnames or []
    rc = 0
    for dbname in dbnames:
        try:
            update_module = config['init'] or config['update']
            registry = Registry.new(dbname, update_module=update_module)
            
            if not registry._assertion_report.wasSuccessful():
                rc += 1
        except Exception:
            _logger.critical('Failed to initialize database `%s`.', dbname, exc_info=True)
            return -1
    return rc


__all__ = ['odoo', 'launch_new_instance', 'check_postgres_user',
           'preload_registries',
           'check_root_user',
           'setup_pid_file', 'rm_pid_file', 'report_configuration']
