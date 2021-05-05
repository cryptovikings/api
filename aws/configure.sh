#!/bin/bash

cd /home/ec2-user/api

npm install

npm run dist

cp src/.env.example dist

rm -rf node_modules

npm install --production

rm -rf .vscode

rm -rf src

rm .editorconfig

rm .eslintignore

rm .eslintrc

rm .gitignore

rm architecture.md

rm deploy.md

rm package-lock.json

rm package.json

rm README.md

rm tsconfig.dist.json

rm tsconfig.json
