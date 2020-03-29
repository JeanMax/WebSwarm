import os

from flask import Flask, render_template
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'not so secret...')
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app)


@app.route('/')
@app.route('/<name>')
def index(name=None):
    return render_template('index.html', name=name)
