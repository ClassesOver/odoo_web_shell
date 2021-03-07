# -*- coding: utf-8 -*-
from setuptools import setup, find_packages
import os
import sys

name = 'odoo_wsgi'

pjoin = os.path.join
root_path = os.path.dirname(__file__)

v = sys.version_info
if v[:2] < (3, 6):
    error = "ERROR: %s requires Python version 3.5 or above." % name
    print(error, file=sys.stderr)
    sys.exit(1)

here = os.path.abspath(os.path.dirname(__file__))
pkg_root = pjoin(here, name)

packages = []
for d, _, _ in os.walk(pjoin(here, name)):
    if os.path.exists(pjoin(d, '__init__.py')):
        packages.append(d[len(here) + 1:].replace(os.path.sep, '.'))

package_data = {
    'odoo_wsgi': ['addons/*.*'],
    'odoo_wsgi': ['.env'],
}

setup(
    name=name,
    version="1.0.0",
    packages=packages,
    author="camera",
    author_email="941642558@qq.com",
    py_modules=['odoo_kernel_launcher', 'odoo_wsgi_cli'],
    package_data=package_data,
    description="IPython Kernel for Odoo web",
    license='BSD',
    long_description="IPython Kernel for Odoo web",
    platforms="Linux, Mac OS X, Windows",
    install_requires=[
        "click",
        "eventlet",
        "gevent",
        "gevent-websocket",
        "greenlet",
        "ipython >= 7.21.0",
        "jupyter >= 1.0.0",
        "python-socketio",
        "python-dotenv",
    ],
    entry_points='''
        [console_scripts]
        odoo-wsgi-bin=odoo_wsgi_cli:cli
    ''',
    python_requires='>=3.6',
)
