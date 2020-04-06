
# Customize this!
NAME = WebShell
AUTHOR = JeanMax
VERSION = 0.1.1


# Some globads
SRC_DIR = src
TEST_DIR = tests

TMP_FILES = build dist temp .pytest_cache .eggs \
			$(shell find . -name __pycache__) \
			$(shell find . -name '*.egg-info') \

TESTER = setup.py --quiet test
FLAKE = flake8
LINTER = pylint --rcfile=setup.cfg $(shell test "$(TERM)" = dumb && echo "-fparseable")
PIP_INSTALL = pip install  # TODO
PIP_UNINSTALL = pip uninstall -y
RM = rm -rfv


# INSTALL
$(NAME): dev

install:
	$(PIP_INSTALL) .
	$(MAKE) front-install
	$(MAKE) front-deploy-prod

dev:
	$(PIP_INSTALL) .[dev]
	$(PIP_INSTALL) --editable .
	$(MAKE) front-install
	$(MAKE) front-deploy

clean:
	$(RM) $(TMP_FILES)

uninstall: clean
	$(PIP_UNINSTALL) $(NAME)

reinstall: uninstall
	$(MAKE) $(NAME)


# FRONT ASSETS
front-install:
	test -e node_modules || npm install

front-deploy:
	npm start

front-deploy-prod:
	npm run deploy

bump-version:
	IFS=. read -r MAJOR MINOR PATCH <<< $(VERSION) && \
	NEW_VERSION=$$MAJOR.$$((MINOR + 1)).$$PATCH && \
	sed -Ei "s/^(VERSION = ).*/\1$$NEW_VERSION/" Makefile && \
	sed -Ei "s/(version=)'.*'/\1'$$NEW_VERSION'/" setup.py && \
	sed -Ei "s/(\"version\": )\".*\"/\1\"$$NEW_VERSION\"/" package.json && \
	git add -A && \
	git commit -m "Bump version (v$$NEW_VERSION)" && \
	git tag v$$NEW_VERSION && \
	echo git push --all --tags origin




# LINT && TEST
eslint:
	npm run lint

lint:
	find $(SRC_DIR) -name \*.py | grep -vE '\.#|flycheck_|eggs' | xargs $(LINTER)

flake:
	$(FLAKE) $(SRC_DIR)

test:
	python -Wall $(TESTER)

todo:
	! grep -rin todo . | grep -vE "^(Binary file|\./\.git|\./Makefile|\./docs|\./"$(SRC_DIR)/$(NAME)"/static|\./setup.py|.*\.egg|\./\.builds|flycheck_|\./\.venv|\./\.pytest_cache|\./node_modules)|./"$(TEST_DIR)"/.pytest_cache"

check: lint flake test eslint
	$(MAKE) todo || true


# Avoid collisions between rules and files
.PHONY: $(NAME), install, dev, clean, clean_db_dump, uninstall, reinstall, \
		front-install, front-deploy,
		lint, flake, test, check, todo,
