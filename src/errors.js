'use strict';

const THEMES = {
  TRACK_SCRATCHED: { emoji: '\u{1F525}', label: 'TRACK SCRATCHED', desc: 'Syntax Error' },
  GHOST_NOTE:      { emoji: '\u{1F480}', label: 'GHOST NOTE',      desc: 'Reference Error' },
  FEEDBACK_LOOP:   { emoji: '\u{26A1}',  label: 'FEEDBACK LOOP',   desc: 'Type Error' },
  BROKEN_STRING:   { emoji: '\u{1F3B8}', label: 'BROKEN STRING',   desc: 'String Error' },
  BAD_IMPORT:      { emoji: '\u{1F4BF}', label: 'BAD IMPORT',      desc: 'Import Error' },
  RUNTIME_CRASH:   { emoji: '\u{1F4A5}', label: 'RUNTIME CRASH',   desc: 'Runtime Error' },
};

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

class RipCodeError extends Error {
  constructor(type, message, line, col, source) {
    super(message);
    this.name = 'RipCodeError';
    this.type = type;
    this.line = line;
    this.col = col;
    this.source = source;
    const theme = THEMES[type] || THEMES.TRACK_SCRATCHED;
    this.emoji = theme.emoji;
    this.label = theme.label;
  }

  format() {
    const theme = THEMES[this.type] || THEMES.TRACK_SCRATCHED;
    const lines = [];

    // Skull art on line-1 errors
    if (this.line === 1) {
      lines.push(`${RED}    _____`);
      lines.push(`   /     \\`);
      lines.push(`  | () () |`);
      lines.push(`   \\  ^  /`);
      lines.push(`    |||||${RESET}`);
    }

    lines.push('');
    lines.push(`${RED}${BOLD}${theme.emoji} ${theme.label}${RESET}${DIM} (${theme.desc})${RESET}`);

    if (this.line != null) {
      let loc = `   at line ${this.line}`;
      if (this.col != null) loc += `, col ${this.col}`;
      lines.push(`${CYAN}${loc}${RESET}`);
    }

    lines.push(`   ${YELLOW}${this.message}${RESET}`);

    if (this.source && this.line != null) {
      const srcLines = this.source.split('\n');
      const lineIdx = this.line - 1;
      if (srcLines[lineIdx] != null) {
        lines.push('');
        lines.push(`${DIM}   ${this.line} | ${RESET}${srcLines[lineIdx]}`);
        if (this.col != null) {
          const pointer = ' '.repeat(this.col - 1) + '^';
          lines.push(`${RED}   ${' '.repeat(String(this.line).length)} | ${pointer}${RESET}`);
        }
      }
    }

    lines.push('');
    return lines.join('\n');
  }
}

function syntaxError(msg, line, col, source) {
  return new RipCodeError('TRACK_SCRATCHED', msg, line, col, source);
}

function referenceError(msg, line, col, source) {
  return new RipCodeError('GHOST_NOTE', msg, line, col, source);
}

function typeError(msg, line, col, source) {
  return new RipCodeError('FEEDBACK_LOOP', msg, line, col, source);
}

function stringError(msg, line, col, source) {
  return new RipCodeError('BROKEN_STRING', msg, line, col, source);
}

module.exports = { RipCodeError, syntaxError, referenceError, typeError, stringError, THEMES };
