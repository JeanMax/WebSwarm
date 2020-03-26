#!/bin/bash -xe

export FLASK_ENV=development
export FLASK_APP=src/WebShell/app.py

flask run
