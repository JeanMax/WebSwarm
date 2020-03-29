"""
We just import here what the end user might needs to import
"""

from WebShell.app import app, socketio  # noqa: F401


def main():
    socketio.run(app)
