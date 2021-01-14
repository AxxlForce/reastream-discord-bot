#!/bin/sh

rm -rf node_modules dist build

# get all dependencies to build app and then remove them as they include node dev dependencies
npm ci && npm run build
rm -rf node_modules

# only install node production dependencies
npm install --production

# install nexe to different folder so it doesn't get bundled
npm install --prefix ./tmp nexe

# build binariesactual binaries using only the node production dependencies
node_modules='node_modules/**/*.{js,wasm}'
mkdir build
./tmp/node_modules/.bin/nexe dist/main.js -r $node_modules -t windows-x64-12.16.2 -o build/reastream-discard-bot.exe
./tmp/node_modules/.bin/nexe dist/main.js -r $node_modules -t mac-x64-12.16.2 -o build/reastream-discard-bot-mac
./tmp/node_modules/.bin/nexe dist/main.js -r $node_modules -t linux-x64-12.16.2 -o build/reastream-discard-bot-linux

# cleanup
#rm -rf node_modules tmp
