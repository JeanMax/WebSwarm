#!/bin/bash
set -e
set -x

test "$VIRTUAL_ENV" || . .venv/bin/activate

export FLASK_ENV=development
export FLASK_APP=src/WebShell/app.py



# AUTO REBUILD
up_to_date() {
	checksum="$1"
	inputs="${@:2}"
    diff <(echo $(cut -d ' ' -f3 < "$checksum")) <(echo $inputs) \
		&& sha1sum --check --status "$checksum" \
		&& return 0
    sha1sum $inputs > "$checksum"
	return 1
}

build_all() {
	checksum_dir=.checksum
	mkdir -p $checksum_dir

	css=$(find src -regex '.*\.s?css$' | grep -vE '\.#|static')
	up_to_date $checksum_dir/css.sha1 $css \
		|| npm run-script css-deploy

	js=$(find src -name '*.js' | grep -vE '\.#|static')
	up_to_date $checksum_dir/js.sha1 $js \
		|| npm run-script js-deploy
}

watch_build() {
	set +x
	build_all
	while build_all; do
		sleep 1
	done
}

watch_build &
flask run
