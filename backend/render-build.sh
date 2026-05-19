#!/usr/bin/env bash
set -e

# Download chrome-headless-shell directly from Google's CDN.
# Bypasses @puppeteer/browsers which keeps failing on Render (folder-exists-but-no-binary bug).
CHROME_VERSION="120.0.6099.109"
CHROME_DIR=".chrome"
CHROME_BIN="${CHROME_DIR}/chrome-headless-shell-linux64/chrome-headless-shell"

if [ ! -f "${CHROME_BIN}" ]; then
  echo "==> Downloading chrome-headless-shell ${CHROME_VERSION}..."
  rm -rf "${CHROME_DIR}"
  mkdir -p "${CHROME_DIR}"
  curl -sL \
    "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chrome-headless-shell-linux64.zip" \
    -o /tmp/chs.zip
  unzip -q /tmp/chs.zip -d "${CHROME_DIR}"
  chmod +x "${CHROME_BIN}"
  rm -f /tmp/chs.zip
  echo "==> Chrome headless shell ready at ${CHROME_BIN}"
fi

npm install --ignore-scripts
npm run build
