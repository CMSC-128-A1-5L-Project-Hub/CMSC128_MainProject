#!/usr/bin/env bash
set -e

# Install Google Chrome via apt (avoids @puppeteer/browsers which keeps failing on Render)
wget -qO /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install -y /tmp/chrome.deb
rm /tmp/chrome.deb

echo "Chrome: $(google-chrome-stable --version)"

# Skip postinstall (which would try to download Chrome again via @puppeteer/browsers)
npm install --ignore-scripts

# Build
npm run build
