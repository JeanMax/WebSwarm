"""
We just import here what the end user might needs to import
"""

import eventlet
eventlet.monkey_patch()

from WebSwarm.app import app, socketio  # pylint: disable=C0413  # noqa: E402


def main():
    socketio.run(app)
