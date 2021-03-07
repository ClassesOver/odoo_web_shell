# -*- coding: utf-8 -*-
import sys
from . import launch_new_instance
if __name__ == '__main__':

    if sys.path[0] == '':
        del sys.path[0]

    launch_new_instance()
