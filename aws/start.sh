#!/bin/bash

cd /home/ec2-user/api-test

screen -S api -d -m node -r ./dist/dotenv.js ./dist/api.js
