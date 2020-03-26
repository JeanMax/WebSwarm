#!/bin/bash -xe

test "$VIRTUAL_ENV" || . .venv/bin/activate

export FLASK_ENV=development
export FLASK_APP=src/WebShell/app.py

flask run
