#!/bin/bash

VENV_DIR=.venv
SECRETS=secrets/secrets.sh

test -e $VENV_DIR || python3 -m venv $VENV_DIR
test "$VIRTUAL_ENV" || . $VENV_DIR/bin/activate

. $SECRETS

test "$1" && ${@:1} || true
