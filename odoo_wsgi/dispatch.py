# -*- coding: utf-8 -*-
import threading
import asyncio
from queue import Queue


class Dispatch(threading.Thread):
    
    def __init__(self, loop, *args, **kwargs):
        self.kernel_handlers = {}
        self.events = Queue()
        self._is_ready = False
        self.loop = loop
        super(Dispatch, self).__init__(*args, **kwargs)
    
    def __call__(self, event, *args, **kwargs):
        
        self.events.put(event)
    
    def is_ready(self):
        return self._is_ready
    
    def register(self, event):
        def handler(fn):
            try:
                callbacks = self.kernel_handlers[event]
            except KeyError:
                callbacks = []
                self.kernel_handlers[event] = callbacks
            callbacks.append(fn)
            return fn
        
        return handler
    
    def _serve_forever(self):
        asyncio.set_event_loop(self.loop)
        
        async def worker():
            self._is_ready = True
            while True:
                if self.events.empty():
                    await asyncio.sleep(1)
                else:
                    event, content = self.events.get()
                    try:
                        handlers = self.kernel_handlers[event]
                        if not isinstance(handlers, list):
                            handlers = [handlers]
                        for handler in handlers:
                            handler(content)
                    except KeyError:
                        pass
                    except RuntimeError:
                        pass
                    except Exception as e:
                        pass
        
        future = asyncio.gather(worker())
        self.loop.run_until_complete(future)
    
    def serve_forever(self):
        self.daemon = True
        self._target = self._serve_forever
        self.start()
        return self


loop = asyncio.new_event_loop()

dispatch = Dispatch(loop=loop).serve_forever()
