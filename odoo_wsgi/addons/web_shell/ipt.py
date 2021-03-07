# -*- coding: utf-8 -*-
import signal
import sys
from .shell import Shell
from .console import ConsoleApp


class App(ConsoleApp):
    
    def __init__(self, worker, **kwargs):
        self.shell = None
        self.worker = worker
        self.db_name = self.worker.db or False
        self.uid = self.worker.uid or False
        self.kernel_client = None
        self.kernel_manager = None
        super(ConsoleApp, self).__init__(**kwargs)
    
    def initialize(self, db_name=False, uid=False, **kwargs):
        self.db_name = db_name
        self.uid = uid
        super(App, self).initialize(**kwargs)
        self.init_shell()

    def restart_kernel(self, **kwargs):
        if self.kernel_manager and self.kernel_manager.is_alive() and self.shell.execution_count > 1:
            self.kernel_manager.restart_kernel(**kwargs)
            self.shell.execution_count = 1
        

    def init_shell(self):
        # relay sigint to kernel
        if self.shell:
            return self.shell
        self.shell = Shell(parent=self, manager=self.kernel_manager, client=self.kernel_client)
        self.shell.own_kernel = False
        return self.shell
    
    def alive(self):
        return self.kernel_manager and self.kernel_manager.is_alive() or False
    
    def handle_sigint(self, *args):
        if self.shell.is_executing():
            if self.kernel_manager:
                self.kernel_manager.interrupt_kernel()
            else:
                print("ERROR: Cannot interrupt kernels we didn't start.",
                      file=sys.stderr)
        else:
            # raise the KeyboardInterrupt if we aren't waiting for execution,
            # so that the interact loop advances, and prompt is redrawn, etc.
            raise KeyboardInterrupt


if __name__ == '__main__':
    app = App(worker=None)
