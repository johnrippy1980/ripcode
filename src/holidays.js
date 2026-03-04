'use strict';

/**
 * RipCode Holiday Easter Eggs
 * Date-triggered surprises that fire on special days.
 */

function getHolidayMessage() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const dayOfWeek = now.getDay(); // 0=Sun, 5=Fri

  // Christmas — Dec 25
  if (month === 12 && day === 25) {
    return {
      type: 'christmas',
      url: 'https://youtube.com/shorts/MKLNG2koneU',
      message: [
        '',
        '\x1b[32m\x1b[1m  \u{1F384} Merry Christmas from RipCode \u{1F384}\x1b[0m',
        '',
        '\x1b[33m  "Happy Birthday Jesus,\x1b[0m',
        '\x1b[33m   hope you like crap."\x1b[0m',
        '\x1b[2m                    — Norm MacDonald\x1b[0m',
        '',
      ],
    };
  }

  // Halloween — Oct 31
  if (month === 10 && day === 31) {
    return {
      type: 'halloween',
      message: [
        '',
        '\x1b[33m\x1b[1m  \u{1F52A} The Night He Came Home \u{1F52A}\x1b[0m',
        '',
      ],
    };
  }

  // Friday the 13th
  if (dayOfWeek === 5 && day === 13) {
    return {
      type: 'friday13',
      message: [
        '',
        '\x1b[31m\x1b[1m  WARNING: Jason Voorhees detected in your node_modules\x1b[0m',
        '',
        '\x1b[2m       _',
        '      | |',
        '     _| |_',
        '    |     |',
        '    | . . |',
        '    |  V  |',
        '    |_____|',
        '  \x1b[0m',
        '\x1b[31m  Ch ch ch... ah ah ah...\x1b[0m',
        '',
      ],
    };
  }

  // April Fools — Apr 1
  if (month === 4 && day === 1) {
    return {
      type: 'aprilfools',
      message: [
        '',
        '\x1b[31m\x1b[1m  CRITICAL: All .rip files have been corrupted\x1b[0m',
        '\x1b[31m  ERROR: Transpiler core dumped (segment fault 0xDEAD)\x1b[0m',
        '\x1b[31m  FATAL: node_modules has achieved sentience\x1b[0m',
        '\x1b[31m  PANIC: Disk write failure — all source code lost\x1b[0m',
        '',
      ],
    };
  }

  // 4/20 — Apr 20
  if (month === 4 && day === 20) {
    return {
      type: '420',
      message: [
        '',
        '\x1b[32m  ...whoa \u270C\uFE0F\x1b[0m',
        '\x1b[2m  everything is... like... fine, man\x1b[0m',
        '',
      ],
    };
  }

  // Pi Day — Mar 14
  if (month === 3 && day === 14) {
    return {
      type: 'piday',
      message: [
        '',
        '\x1b[36m\x1b[1m  \u{1D70B} Happy Pi Day \u{1D70B}\x1b[0m',
        '\x1b[36m  3.14159265358979323846264338327950288...\x1b[0m',
        '\x1b[2m  Today we honor the irrational.\x1b[0m',
        '',
      ],
    };
  }

  // Talk Like a Pirate Day — Sep 19
  if (month === 9 && day === 19) {
    return {
      type: 'pirate',
      message: [
        '',
        '\x1b[33m  I don\'t do this.\x1b[0m',
        '',
      ],
    };
  }

  return null;
}

module.exports = { getHolidayMessage };
