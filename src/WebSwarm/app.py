import os
from threading import Lock

from flask import Flask, current_app, request
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
    async_mode='eventlet'
)

game_thread = None
game_lock = Lock()
update_lock = Lock()

chat = Chat()
world = World()


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
    # TODO: it would be better to send that on connection,
    # with all the game constants


@socketio.on('login')
def on_login(json):
    log.info(f'Login: {json}')


@socketio.on('logout')
def on_logout(json):
    log.info(f'Logout: {json}')
    rm_player()


@socketio.on('start_game')
def on_startgame(json):
    log.info(f'Start game: {json}')
    add_player()


@socketio.on('stop_game')
def on_stopgame(json):
    log.info(f'Stop game: {json}')
    rm_player()


@socketio.on('connect')
def on_connect():
    global game_thread
    log.info('Client connected')
    with game_lock:
        if game_thread is None:
            game_thread = socketio.start_background_task(game_loop)


@socketio.on('disconnect')
def on_disconnect():
    log.info('Client disconnected')
    rm_player()


@socketio.on_error()
def on_error(e):
    log.warning(f"Socket error: {e}")


# BACKGROUND GAME THREAD

def game_loop():
    timer = FrameRateHandler(socketio.sleep, fps=30)
    while True:
        socketio.emit(
            "update",
            world.to_json()
        )
        with update_lock:
            world.next_frame()
        timer.wait_next_frame()


# GAME UPDATE HELPERS

def add_player():
    sid = request.sid
    username = request.cookies.get('user', None)
    with update_lock:
        world.add_player(sid, username)


def rm_player():
    sid = request.sid
    username = request.cookies.get('user', None)
    with update_lock:
        world.rm_player(sid, username)
