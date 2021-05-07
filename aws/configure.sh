#!/bin/bash

source /root/.bashrc

cd /home/ec2-user

cp .env api

cd api

npm install

npm run dist

rm -rf node_modules

npm install --production

rm -rf .vscode

rm -rf src

rm -f -f .editorconfig

rm -f .eslintignore

rm -f .eslintrc

rm -f .gitignore

rm -f architecture.md

rm -f deploy.md

rm -f package-lock.json

rm -f package.json

rm -f README.md

rm -f tsconfig.dist.json

rm -f tsconfig.json
