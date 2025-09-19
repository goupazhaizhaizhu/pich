#!/bin/bash

source ~/.nvm/nvm.sh

set -ex

startTime=`date +%s`

time git pull

time rm -rf node_modules/

time npm cache clear --force


time npm install --force

time npm run build
