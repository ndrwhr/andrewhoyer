#!/bin/bash
set -e

rm -rvf dist &&
    yarn build
    rsync -atvz dist/ asquared@andrew-hoyer.com:~/public_html/
    rsync -atvz dist/ asquared@andrew-hoyer.com:~/public_html/andrew/
