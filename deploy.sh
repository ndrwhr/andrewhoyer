#!/bin/bash
set -e

rm -rvf _site &&
    jekyll build
    rsync -atvz _site/ asquared@andrew-hoyer.com:~/public_html/
    rsync -atvz _site/ asquared@andrew-hoyer.com:~/public_html/andrew/