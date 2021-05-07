#!/bin/bash

cd /home/ec2-user

if screen -ls | grep api > /dev/null; then
    screen -X -S api quit
fi
