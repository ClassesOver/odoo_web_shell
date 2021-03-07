# -*- coding: utf-8 -*-
import atexit
import os
import signal
import sys
import uuid
from ipython_genutils.path import filefind
from traitlets import (List, Unicode, Instance, observe, CUnicode, CBool, Type)

from jupyter_client.blocking import BlockingKernelClient
from jupyter_client.restarter import KernelRestarter
from jupyter_client import connect
from jupyter_client.kernelspec import NoSuchKernel
from jupyter_client.session import Session
from jupyter_client.kernelspec import KernelSpecManager as JupyterKernelSpecManager

ConnectionFileMixin = connect.ConnectionFileMixin
from jupyter_client.connect import ConnectionFileMixin, find_connection_file
from jupyter_client.manager import KernelManager as JupyterKernelManager
from jupyter_core.paths import (jupyter_data_dir, jupyter_runtime_dir)
from jupyter_core.utils import ensure_dir_exists
from odoo_wsgi import odoo
import json
from ipykernel.kernelspec import make_ipkernel_cmd

NATIVE_KERNEL_NAME = 'python3'


def get_kernel_dict(extra_arguments=None):
    return {
        'argv'        : make_ipkernel_cmd(mod='odoo_kernel_launcher', extra_arguments=extra_arguments),
        'display_name': 'Python %i' % sys.version_info[0],
        'language'    : 'python',
    }


class KernelSpecManager(JupyterKernelSpecManager):
    
    def _get_kernel_spec_by_name(self, kernel_name, resource_dir):
        
        if kernel_name == NATIVE_KERNEL_NAME:
            try:
                from ipykernel.kernelspec import RESOURCES
            except ImportError:
                # It should be impossible to reach this, but let's play it safe
                pass
            else:
                if resource_dir == RESOURCES:
                    return self.kernel_spec_class(resource_dir=resource_dir, **get_kernel_dict())
        
        try:
            import odoo_kernel_launcher
        except ImportError:
            return self.kernel_spec_class.from_resource_dir(resource_dir)
        else:
            return self.kernel_spec_class(resource_dir=resource_dir, **get_kernel_dict())


class KernelManager(JupyterKernelManager):
    kernel_spec_manager = Instance(KernelSpecManager)
    
    def _kernel_spec_manager_default(self):
        return KernelSpecManager(data_dir=self.data_dir)
    
    def _launch_kernel(self, kernel_cmd, **kw):
        args = ['--addons-path=%s' % odoo.tools.config['addons_path'],
                '--db_host=%s' % odoo.tools.config['db_host'],
                '--db_password=%s' % odoo.tools.config['db_password'],
                '--db_user=%s' % odoo.tools.config['db_user'],
                '--db_port=%s' % odoo.tools.config['db_port'],
                '-d',
                odoo.tools.config['db_name'],
                ]
        return super(KernelManager, self)._launch_kernel(kernel_cmd + args, **kw)
    
       

class ConsoleApp(ConnectionFileMixin):
    classes = [KernelManager, KernelRestarter, Session]
    
    data_dir = Unicode()
    
    def _data_dir_default(self):
        d = jupyter_data_dir()
        ensure_dir_exists(d, mode=0o700)
        return d
    
    runtime_dir = Unicode()
    
    def _runtime_dir_default(self):
        rd = jupyter_runtime_dir()
        ensure_dir_exists(rd, mode=0o700)
        return rd
    
    @observe('runtime_dir')
    def _runtime_dir_changed(self, change):
        ensure_dir_exists(change['new'], mode=0o700)
    
    kernel_manager_class = Type(
        default_value=KernelManager,
        config=True,
        help='The kernel manager class to use.'
    )
    
    kernel_client_class = BlockingKernelClient
    
    kernel_argv = List(Unicode())
    
    def _connection_file_default(self):
        return 'kernel-%i.json' % os.getpid()
    
    existing = CUnicode('', config=True,
                        help="""Connect to an already running kernel""")
    
    kernel_name = Unicode('python', config=True,
                          help="""The name of the default kernel to start.""")
    
    confirm_exit = CBool(True, config=True,
                         help="""
        Set to display confirmation dialog on exit. You can always use 'exit' or 'quit',
        to force a direct exit without any confirmation.""",
                         )
    
    def build_kernel_argv(self, argv=None):
        """build argv to be passed to kernel subprocess

        Override in subclasses if any args should be passed to the kernel
        """
        self.kernel_argv = self.extra_args
    
    def init_connection_file(self):
        if self.existing:
            try:
                cf = find_connection_file(self.existing, ['.', self.runtime_dir])
            except Exception:
                self.log.critical("Could not find existing kernel connection file %s", self.existing)
                self.exit(1)
            self.log.debug("Connecting to existing kernel: %s" % cf)
            self.connection_file = cf
        else:
            # not existing, check if we are going to write the file
            # and ensure that self.connection_file is a full path, not just the shortname
            try:
                cf = find_connection_file(self.connection_file, [self.runtime_dir])
            except Exception:
                # file might not exist
                if self.connection_file == os.path.basename(self.connection_file):
                    # just shortname, put it in security dir
                    cf = os.path.join(self.runtime_dir, self.connection_file)
                else:
                    cf = self.connection_file
                self.connection_file = cf
        try:
            self.connection_file = filefind(self.connection_file, ['.', self.runtime_dir])
        except IOError:
            self.log.debug("Connection File not found: %s", self.connection_file)
            return
        
        # should load_connection_file only be used for existing?
        # as it is now, this allows reusing ports if an existing
        # file is requested
        try:
            self.load_connection_file()
        except Exception:
            self.log.error("Failed to load connection file: %r", self.connection_file, exc_info=True)
            self.exit(1)
    
    def _new_connection_file(self):
        cf = ''
        while not cf:
            # we don't need a 128b id to distinguish kernels, use more readable
            # 48b node segment (12 hex chars).  Users running more than 32k simultaneous
            # kernels can subclass.
            ident = str(uuid.uuid4()).split('-')[-1]
            cf = os.path.join(self.runtime_dir, 'kernel-%s.json' % ident)
            # only keep if it's actually new.  Protect against unlikely collision
            # in 48b random search space
            cf = cf if not os.path.exists(cf) else ''
        return cf
    
    def init_kernel_manager(self):
        # Don't let Qt or ZMQ swallow KeyboardInterupts.
        if self.existing:
            self.kernel_manager = None
            return
        
        # Create a KernelManager and start a kernel.
        try:
            self.kernel_manager = self.kernel_manager_class()
        except NoSuchKernel:
            self.log.critical("Could not find kernel %s", self.kernel_name)
            self.exit(1)
        
        self.kernel_manager.client_factory = self.kernel_client_class
        kwargs = {}
        kwargs['extra_arguments'] = self.kernel_argv
        self.kernel_manager.start_kernel(**kwargs)
        atexit.register(self.kernel_manager.cleanup_ipc_files)
        
        # in case KM defaults / ssh writing changes things:
        km = self.kernel_manager
        self.shell_port = km.shell_port
        self.iopub_port = km.iopub_port
        self.stdin_port = km.stdin_port
        self.hb_port = km.hb_port
        self.control_port = km.control_port
        self.connection_file = km.connection_file
        
        atexit.register(self.kernel_manager.cleanup_connection_file)
    
    def init_kernel_client(self):
        self.kernel_client = self.kernel_manager.client()
        self.kernel_client.start_channels()
    
    def initialize(self, **kwargs):
        self.init_connection_file()
        self.init_kernel_manager()
        self.init_kernel_client()
    
    def new_kernel_client(self):
        if self.kernel_client:
            self.kernel_client.close()
        self.kernel_client = self.kernel_manager.client()
        self.kernel_client.start_channels()
    
    def handle_sigint(self, *args):
        if self.kernel_manager:
            self.kernel_manager.interrupt_kernel()
        else:
            print("ERROR: Cannot interrupt kernels we didn't start.",
                  file=sys.stderr)


if __name__ == '__main__':
    app = ConsoleApp()
    app.initialize()
