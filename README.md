# WebSwarm

A website based, multiplayer game, boid simulator, and much more!

[![builds.sr.ht status](https://builds.sr.ht/~jean-max/WebS.svg)](https://builds.sr.ht/~jean-max/WebS) - archlinux build


## Usage:

You can run the flask server like this:

```shell
./runserver.sh
```


## Dependencies:

* python3
* npm


## Installation: Makefile

To ease the process of installing/linting/testing the project, a Makefile is available.

If you don't specify any target, the default install process will be launched (ie: the dev install, with an editable python package).
You'd run it like this:

```shell
make
```

It is the same as:

```shell
make dev
```

An 'editable' installation means that the package installed will actually be a link to your project folder, so every modification that you'd make to your codebase will be automatically available in the installed package.

If you want a classic' installation, run:

```shell
make install
```
