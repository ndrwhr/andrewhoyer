#!/bin/bash
set -e

rm -rvf _site &&
    jekyll build
    rsync -atvz --delete _site/ asquared@andrew-hoyer.com:~/public_html/