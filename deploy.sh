#!/bin/bash
set -e
set -x

PROJECT=rmrf
GUNICORN_USER=superuser3000
NGINX_USER=http
HTTP_GROUP=http

ROOTFS=/home/$GUNICORN_USER/$PROJECT/rootfs
TRASH=$HOME/.local/share/Trash/files
STATIC_DIR=/srv/http/static

RUNNER_SCRIPT=run_with_env.sh
INSTALL_LOCK=.installed


handle_secrets() {
    set +x  # ushhh
    if ! test $SECRET_PASSWORD; then
        echo "SECRET_PASSWORD isn't set, gpg secrets won't be handled"
        set -x
        . $RUNNER_SCRIPT
        return
    fi
    set -x

    for secret in $(find . -name '*.gpg'); do
        dst="${secret/.gpg/}"
        trash_it "$dst"
        set +x  # ushhh
        echo "Decrypting secret: $secret -> $dst"
        gpg --batch --passphrase $SECRET_PASSWORD \
            -o "$dst" -d "$secret"
        set -x
    done

    . $RUNNER_SCRIPT
}

create_gunicorn_user() {
    id $GUNICORN_USER || sudo useradd -m -g $HTTP_GROUP $GUNICORN_USER
}

run_as_project_user() {
    sudo su $GUNICORN_USER -c "
cd /home/$GUNICORN_USER/$PROJECT
./$RUNNER_SCRIPT $1"
}

start_services() {
    for s in $@; do
        systemctl status $s.service | grep -q 'Active: active' \
            || sudo systemctl start $s.service
    done
}

trash_it() {
    if test -e $1 || test -L $1; then
        sudo mv $1 $TRASH/$(basename $1).$(date "+%y-%m-%d_%H-%M-%S").bak
    fi
}

copy_rootfs() {
    mkdir -p $TRASH
    sudo find $ROOTFS -type d \
        | grep -vE "$ROOTFS\$" \
        | sed -E "s|$ROOTFS||g" \
        | xargs sudo mkdir -pv

    for src in $(sudo find $ROOTFS -type l); do
        dst=$(echo $src | sed -E "s|$ROOTFS||g")
        trash_it $dst
        sudo cp -a $src $dst
    done

    for src in $(sudo find $ROOTFS -type f); do
        if echo $src | grep -qE 'gpg$'; then
            continue
        fi
        dst=$(echo $src | sed -E "s|$ROOTFS||g")
        trash_it $dst
        sudo ln -sv $src $dst
    done

    sudo systemctl daemon-reload
}

sync_project() {
    sudo mkdir -p /home/$GUNICORN_USER/$PROJECT/rootfs
    sudo rsync -a --delete \
         --exclude .git \
         --exclude .gitignore \
         --exclude LICENSE \
         --exclude .builds \
         --exclude .checksum \
         --exclude .eggs \
         --exclude .pytest_cache \
         --exclude runserver.sh \
         --exclude deploy.sh \
         --exclude tests \
         --exclude $INSTALL_LOCK \
         --exclude .venv \
         ./$1 \
         /home/$GUNICORN_USER/$PROJECT/.
    sudo chown -R $GUNICORN_USER:$HTTP_GROUP /home/$GUNICORN_USER/$PROJECT
    sudo chown -R root:root /home/$GUNICORN_USER/$PROJECT/rootfs
}

sync_static() {
    sudo mkdir -p $STATIC_DIR
    sudo rsync -a --delete \
         $(sudo find /home/$GUNICORN_USER/$PROJECT/src -name static)/ \
         $STATIC_DIR  # --delete?
    sudo chown -R $NGINX_USER:$HTTP_GROUP /srv/http/static
}


handle_secrets
test -e $INSTALL_LOCK || create_gunicorn_user
sync_project rootfs
copy_rootfs
test -e $INSTALL_LOCK || start_services nginx gunicorn
test -e $INSTALL_LOCK || make
test -e $INSTALL_LOCK || make check

# broke
test -e $INSTALL_LOCK || sync_project
test -e $INSTALL_LOCK || run_as_project_user "make install"
test -e $INSTALL_LOCK || sync_static
test -e $INSTALL_LOCK || sudo systemctl enable nginx.service gunicorn.socket
sudo systemctl restart {nginx,gunicorn}.service
# ekorb

mkdir -p $INSTALL_LOCK
