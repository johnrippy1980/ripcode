'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const RIPCODE_DIR = path.join(os.homedir(), '.ripcode');
const SENTINEL = path.join(RIPCODE_DIR, '.first-run-complete');

function isFirstRun() {
  return !fs.existsSync(SENTINEL);
}

function markFirstRunComplete() {
  if (!fs.existsSync(RIPCODE_DIR)) {
    fs.mkdirSync(RIPCODE_DIR, { recursive: true });
  }
  fs.writeFileSync(SENTINEL, new Date().toISOString());
}

module.exports = { isFirstRun, markFirstRunComplete };
