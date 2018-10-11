#!/usr/bin/env bash

git add . && git commit -am 'code almost done'

git push -u origin master

git add dist && git commit -am 'something done'

git subtree push --prefix dist origin gh-pages