import os
from threading import Lock

from flask import Flask, current_app
from flask_socketio import SocketIO, emit

import WebSwarm.log as log
from WebSwarm.framerate import FrameRateHandler
from WebSwarm.twodim import World
from WebSwarm.chat import Chat


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'not so secret...')
socketio = SocketIO(
    app,
    logger=int(os.environ.get('VERBOSE', 2)) > 1,
    engineio_logger=int(os.environ.get('VERBOSE', 2)) > 1,
    async_mode='eventlet',
)

thread = None
thread_lock = Lock()

chat = Chat()


# INDEX: static html

@app.route('/')
def index():
    """
    This is just used with the dev server,
    otherwise nginx will return the static html file
    """
    return current_app.send_static_file('index.html')


# SOCKETS

@socketio.on('chat_msg')
def on_chat_msg(json):
    log.info(f'Chat msg: {json}')
    emit('srv_chat_msg', json, broadcast=True)
    chat.add_msg(json)


@socketio.on('chat_logs')
def on_chat_logs(json):
    log.info(f'Chat logs: {json}')
    emit('srv_chat_logs', chat.logs)


@socketio.on('login')
def on_login(json):
    log.info(f'Login: {json}')


@socketio.on('logout')
def on_logout(json):
    log.info(f'Logout: {json}')


@socketio.on('connect')
def on_connect():
    log.info('Client connected')
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(game_loop)


@socketio.on('disconnect')
def on_disconnect():
    log.info('Client disconnected')


@socketio.on_error()
def on_error(e):
    log.warning(f"Socket error: {e}")


# BACKGROUND THREAD

def game_loop():
    world = World()
    timer = FrameRateHandler(socketio.sleep, fps=30)
    while True:
        socketio.emit(
            "update",
            world.to_json()
        )
        world.next_frame()
        timer.wait_next_frame()
