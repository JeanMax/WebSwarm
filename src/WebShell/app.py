import os

from flask import Flask, current_app
from flask_socketio import SocketIO, emit

import WebShell.log as log


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'not so secret...')
socketio = SocketIO(
    app,
    logger=int(os.environ.get('VERBOSE', 2)) > 1,
    engineio_logger=int(os.environ.get('VERBOSE', 2)) > 1
    # async_mode='eventlet',
    # cors_allowed_origins='*'
)


# INDEX: static html

@app.route('/')
def index():
    """
    This is just used with the dev server,
    otherwise nginx will return the static html file
    """
    return current_app.send_static_file('index.html')


# SOCKETS

@socketio.on('custom_event')
def handle_my_custom_event(json):
    log.info(f'Custom event: received json: {json}')
    emit('test', {"pouet": 42}, broadcast=True, include_self=True)
    return True  # confirmation


@socketio.on('chat_msg')
def on_chat_msg(json):
    log.info(f'Chat msg: {json}')
    emit('chat_message_log', json, broadcast=True, include_self=True)
    return True  # confirmation


@socketio.on('login')
def on_login(json):
    log.info(f'Login: {json}')


@socketio.on('logout')
def on_logout(json):
    log.info(f'Logout: {json}')


@socketio.on('connect')
def on_connect():
    log.info('Client connected')


@socketio.on('disconnect')
def on_disconnect():
    log.info('Client disconnected')


@socketio.on_error()
def on_error(e):
    log.warning(f"Socket error: {e}")
