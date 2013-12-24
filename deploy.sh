#!/bin/bash
set -e

rm -rvf _site &&
    (cd experiments/blob; ./build.sh; ./making-of/build.py) &&
    compass compile &&
    jekyll build &&
    rsync -atvz --delete _site/ asquared@andrew-hoyer.com:~/public_html/andrewhoyer/