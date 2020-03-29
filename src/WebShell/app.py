import os

from flask import Flask, current_app
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'not so secret...')
socketio = SocketIO(app)


@app.route('/')
def index():
    return current_app.send_static_file('index.html')


@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))
