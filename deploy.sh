#!/bin/bash
set -e

rm -rvf _site &&
    (cd experiments/blob; ./build.sh; ./making-of/build.py) &&
    jekyll build &&
    rsync -atvz --delete _site/ asquared@andrew-hoyer.com:~/public_html/