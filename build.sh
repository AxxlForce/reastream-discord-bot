#!/bin/sh

rm -rf node_modules dist
npm ci
npm run build
nexe dist/src/main.js -r "node_modules/**/*" -t windows-x64-12.16.2 -o reastream-discard-bot.exe
nexe dist/src/main.js -r "node_modules/**/*" -t mac-x64-12.16.2 -o reastream-discard-bot-mac
nexe dist/src/main.js -r "node_modules/**/*" -t linux-x64-12.16.2 -o reastream-discard-bot-linux

