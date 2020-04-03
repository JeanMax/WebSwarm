#!/bin/bash
set -e
set -x



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

	html=$(find src -name '*.html' | grep -vE '\.#|static')
	up_to_date $checksum_dir/html.sha1 $html \
		|| npm run-script html-deploy
}

watch_build() {
	set +x
	build_all
	while build_all; do
		sleep 1
	done
}


. run_with_env.sh
export FLASK_ENV=development

watch_build &
# FLASK_APP=src/WebShell/app.py flask run
VERBOSE=3 webshell
