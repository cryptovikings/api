#!/bin/bash

source /root/.bashrc

cd /home/ec2-user

screen -S api -d -m node -r ./api/dist/dotenv.js ./api/dist/api.js
