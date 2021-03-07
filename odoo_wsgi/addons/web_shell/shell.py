# -*- coding: utf-8 -*-
import logging
from jupyter_console.ptshell import ZMQTerminalInteractiveShell
from jupyter_console import __version__
from queue import Empty
from zmq import ZMQError
import errno
import sys
from traitlets import (Unicode)
import time
import os
from contextlib import contextmanager

import eventlet
eventlet.listen
@contextmanager
def redirect(pipe_pair):
    _rfd, _wfd = pipe_pair
    proxy = os.fdopen(_wfd, mode='w')
    
    original_stdout = sys.stdout
    original_stderr = sys.stderr
    
    # Enter.
    sys.stdout = proxy
    sys.stderr = proxy
    
    try:
        yield _rfd
    finally:
        # Exit.
        proxy.flush()
        proxy.close()
        
        sys.stdout = original_stdout
        sys.stderr = original_stderr


class Shell(ZMQTerminalInteractiveShell):
    banner = Unicode('My Console {version}\n\n{kernel_banner}', config=True,
                     help=("Text to display before the first prompt. Will be formatted with "
                           "variables {version} and {kernel_banner}.")
                     )
    
    def __init__(self, **kwargs):
        super(Shell, self).__init__(**kwargs)
    
    
    def show_banner(self):
        banner = self.banner.format(version=__version__,
                                    kernel_banner=self.kernel_info.get('banner', ''))
        return banner
    
    def init_kernel_info(self):
        """Wait for a kernel to be ready, and store kernel info"""
        timeout = self.kernel_timeout
        tic = time.time()
        self.client.hb_channel.unpause()
        msg_id = self.client.kernel_info()
        while True:
            try:
                reply = self.client.get_shell_msg(timeout=1)
            except Empty:
                if (time.time() - tic) > timeout:
                    logging.error("Kernel didn't respond to kernel_info_request")
            else:
                if reply['parent_header'].get('msg_id') == msg_id:
                    self.kernel_info = reply['content']
                    return
    
    def init_prompt_toolkit_cli(self):
        pass
    
    def run_cell(self, cell, store_history=True):
        out = ''
        if (not cell) or cell.isspace():
            return self.handle_iopub()
        while self.client.shell_channel.msg_ready():
            self.client.shell_channel.get_msg()
        msg_id = self.client.execute(cell, not store_history)
        self._executing = True
        self._execution_state = "busy"
        while self._execution_state != 'idle' and self.client.is_alive():
            try:
                self.handle_input_request(msg_id, timeout=0.05)
            except Empty:
                # display intermediate print statements, etc.
                out +=self.handle_iopub(msg_id)
            except ZMQError as e:
                # Carry on if polling was interrupted by a signal
                if e.errno != errno.EINTR:
                    raise
        while self.client.is_alive():
            try:
                out +=self.handle_execute_reply(msg_id, timeout=0.05)
            except Empty:
                pass
            else:
                break
        self._executing = False
        return out
    
    def handle_iopub(self, msg_id=''):
        _rfd, _wfd = os.pipe()
        with redirect((_rfd, _wfd)):
            super(Shell, self).handle_iopub(msg_id=msg_id)
        f = os.fdopen(_rfd, 'r')
        text = f.read()
        return text
    
    print = staticmethod(print)
    
    def handle_iopub(self, msg_id=''):
        l = []
        def print(value='', end='\n', **kwargs):
            value = value + end
            l.append(value)
            
        while self.client.iopub_channel.msg_ready():
            sub_msg = self.client.iopub_channel.get_msg()
            msg_type = sub_msg['header']['msg_type']
            parent = sub_msg["parent_header"]

            # Update execution_count in case it changed in another session
            if msg_type == "execute_input":
                self.execution_count = int(sub_msg["content"]["execution_count"]) + 1

            if self.include_output(sub_msg):
                if msg_type == 'status':
                    self._execution_state = sub_msg["content"]["execution_state"]
                elif msg_type == 'stream':
                    if sub_msg["content"]["name"] == "stdout":
                        if self._pending_clearoutput:
                            print("\r", end="")
                            self._pending_clearoutput = False
                        print(sub_msg["content"]["text"], end="")
                        sys.stdout.flush()
                    elif sub_msg["content"]["name"] == "stderr":
                        if self._pending_clearoutput:
                            print("\r", file=sys.stderr, end="")
                            self._pending_clearoutput = False
                        print(sub_msg["content"]["text"], file=sys.stderr, end="")
                        sys.stderr.flush()

                elif msg_type == 'execute_result':
                    if self._pending_clearoutput:
                        print("\r", end="")
                        self._pending_clearoutput = False
                    self.execution_count = int(sub_msg["content"]["execution_count"])
                    if not self.from_here(sub_msg):
                        sys.stdout.write(self.other_output_prefix)
                    format_dict = sub_msg["content"]["data"]
                    self.handle_rich_data(format_dict)

                    if 'text/plain' not in format_dict:
                        continue

                    # prompt_toolkit writes the prompt at a slightly lower level,
                    # so flush streams first to ensure correct ordering.
                    sys.stdout.flush()
                    sys.stderr.flush()
                    print('Out[%d]: ' % self.execution_count, end='', file=sys.stdout)
                    text_repr = format_dict['text/plain']
                    if '\n' in text_repr:
                        # For multi-line results, start a new line after prompt
                        print()
                    print(text_repr)

                elif msg_type == 'display_data':
                    data = sub_msg["content"]["data"]
                    handled = self.handle_rich_data(data)
                    if not handled:
                        if not self.from_here(sub_msg):
                            sys.stdout.write(self.other_output_prefix)
                        # if it was an image, we handled it by now
                        if 'text/plain' in data:
                            print(data['text/plain'])

                elif msg_type == 'execute_input':
                    content = sub_msg['content']
                    if not self.from_here(sub_msg):
                        sys.stdout.write(self.other_output_prefix)
                    sys.stdout.write('In [{}]: '.format(content['execution_count']))
                    sys.stdout.write(content['code'] + '\n')

                elif msg_type == 'clear_output':
                    if sub_msg["content"]["wait"]:
                        self._pending_clearoutput = True
                    else:
                        print("\r", end="")

                elif msg_type == 'error':
                    for frame in sub_msg["content"]["traceback"]:
                        print(frame, file=sys.stderr)
                        
                        
        return "".join(l)
    
    def handle_execute_reply(self, msg_id, timeout=None):
        out = None
        msg = self.client.shell_channel.get_msg(block=False, timeout=timeout)
        if msg["parent_header"].get("msg_id", None) == msg_id:
            
            out = self.handle_iopub(msg_id)
            
            content = msg["content"]
            status = content['status']
            
            if status == 'aborted':
                self.write('Aborted\n')
                return
            elif status == 'ok':
                # handle payloads
                for item in content.get("payload", []):
                    source = item['source']
                    if source == 'page':
                        # page.page(item['data']['text/plain'])
                        out += item['data']['text/plain']
                    elif source == 'set_next_input':
                        self.next_input = item['text']
                    elif source == 'ask_exit':
                        self.keepkernel = item.get('keepkernel', False)
                        self.ask_exit()
            
            elif status == 'error':
                pass
            
            self.execution_count = int(content["execution_count"] + 1)
        return out
