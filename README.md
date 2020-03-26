# WebShell

A website acting as a remote shell.


## Installation: Makefile

To ease the process of installing/linting/testing the project, a Makefile is available. <br />
<br />
If you don't specify any target, the default install process will be launched (ie: the dev install, with an editable python package).
You'd run it like this:

```shell
make
```

It is the same as:

```shell
make dev
```

An 'editable' installation means that the package installed will actually be a link to your project folder, so every modification that you'd make to your codebase will be automatically available in the installed package.<br />
If you want a classic' installation, run:

```shell
make install
```



## Usage:

* You can run the flask server like this:

```shell
./runserver.sh
```
