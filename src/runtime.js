'use strict';

/**
 * RipCode Runtime — helper functions injected into transpiled output
 */

// Pipeline operator helper: pipes value through a chain of functions
function __ripPipe(value, ...fns) {
  const result = fns.reduce((acc, fn) => fn(acc), value);
  // Easter egg: 10+ stage pipelines get respect
  if (fns.length >= 10) {
    console.log('\x1b[35m  Brutal pipeline. Respect. \x1b[0m');
  }
  return result;
}

// Mosh pit: runs promises concurrently (Promise.all wrapper)
async function __ripMosh(promises) {
  try {
    const results = await Promise.all(promises);
    // Easter egg: 5+ concurrent tasks survived the pit
    if (promises.length >= 5) {
      console.log(`\x1b[36m  Mosh pit survived. ${promises.length} crowd surfers made it. \x1b[0m`);
    }
    return results;
  } catch (err) {
    throw new Error(`Mosh pit crash: ${err.message}`);
  }
}

// Noise levels — themed console output
function whisper(...args) {
  console.debug('\x1b[2m[whisper]\x1b[0m', ...args);
}

function say(...args) {
  // Easter egg: say 42 gets "The Answer"
  if (args.length === 1 && args[0] === 42) {
    console.log(42, '\x1b[2m(The Answer)\x1b[0m');
    return;
  }
  console.log(...args);
}

function yell(...args) {
  console.warn('\x1b[33m[yell]\x1b[0m', ...args);
}

function scream(...args) {
  // Easter egg: scream auto-uppercases strings (because screaming)
  const uppered = args.map(a => typeof a === 'string' ? a.toUpperCase() : a);
  console.error('\x1b[31m[SCREAM]\x1b[0m', ...uppered);
}

module.exports = { __ripPipe, __ripMosh, whisper, say, yell, scream };
