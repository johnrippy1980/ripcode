'use strict';

/**
 * RipCode Runtime — helper functions injected into transpiled output
 */

// Pipeline operator helper: pipes value through a chain of functions
function __ripPipe(value, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// Mosh pit: runs promises concurrently (Promise.all wrapper)
async function __ripMosh(promises) {
  try {
    return await Promise.all(promises);
  } catch (err) {
    throw new Error(`Mosh pit crash: ${err.message}`);
  }
}

// Noise levels — themed console output
function whisper(...args) {
  console.debug('\x1b[2m[whisper]\x1b[0m', ...args);
}

function say(...args) {
  console.log(...args);
}

function yell(...args) {
  console.warn('\x1b[33m[yell]\x1b[0m', ...args);
}

function scream(...args) {
  console.error('\x1b[31m[SCREAM]\x1b[0m', ...args);
}

module.exports = { __ripPipe, __ripMosh, whisper, say, yell, scream };
