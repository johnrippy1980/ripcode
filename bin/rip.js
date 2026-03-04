#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { tokenize } = require('../src/lexer');
const { parse } = require('../src/parser');
const { transpile } = require('../src/transpiler');
const { RipCodeError } = require('../src/errors');
const {
  SOLO_FRAMES, HORNS_666, CREDITS, LORE_TEXT, NOISE_BARS,
  WELCOME, VERSION_TAGLINES, GOLDEN_BANNER, BUILD_CELEBRATIONS,
} = require('../src/ascii');
const { isFirstRun, markFirstRunComplete } = require('../src/firstrun');

const VERSION = '0.1.1';

const BANNER = `
   ____  _       ____          _
  |  _ \\(_)_ __ / ___|___   __| | ___
  | |_) | | '_ \\ |   / _ \\ / _\` |/ _ \\
  |  _ <| | |_) | |__| (_) | (_| |  __/
  |_| \\_\\_| .__/ \\____\\___/ \\__,_|\\___|
           |_|
  v${VERSION} \u2014 "Rip it. Ship it." \u{1F918}
`;

const USAGE = `
Usage:
  rip run <file.rip>            Transpile and execute a .rip file
  rip build <file.rip> [-o out] Transpile to JavaScript
  rip init [name]               Scaffold a new RipCode project
  rip version                   Show version
  rip help                      Show this message
`;

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* busy wait for sync animation */ }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // First-run welcome (one-time)
  if (isFirstRun()) {
    console.log(WELCOME);
    markFirstRunComplete();
  }

  if (!command || command === 'help') {
    // 1/50 chance golden banner
    if (Math.random() < 0.02) {
      console.log(GOLDEN_BANNER);
    } else {
      console.log(BANNER);
    }
    console.log(USAGE);
    return;
  }

  switch (command) {
    case 'run': return cmdRun(args.slice(1));
    case 'build': return cmdBuild(args.slice(1));
    case 'init': return cmdInit(args.slice(1));
    case 'version': return cmdVersion();
    case 'solo': return cmdSolo();
    case 'lore': return cmdLore();
    case 'noise': return cmdNoise();
    case '666': return cmd666();
    case 'credits': return cmdCredits();
    default:
      // If it's a .rip file, treat as `run`
      if (command.endsWith('.rip')) return cmdRun(args);
      console.error(`Unknown command: ${command}`);
      console.log(USAGE);
      process.exit(1);
  }
}

function compileFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`\x1b[31mFile not found: ${filePath}\x1b[0m`);
    process.exit(1);
  }

  const source = fs.readFileSync(filePath, 'utf-8');

  try {
    const tokens = tokenize(source);
    const ast = parse(tokens, source);
    const js = transpile(ast);
    return js;
  } catch (err) {
    if (err instanceof RipCodeError) {
      console.error(err.format());
    } else {
      console.error(`\x1b[31mCompilation error:\x1b[0m ${err.message}`);
    }
    process.exit(1);
  }
}

function cmdRun(args) {
  if (args.length === 0) {
    console.error('Usage: rip run <file.rip>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  const js = compileFile(filePath);

  // Write to temp file and execute
  const tmpDir = path.join(require('os').tmpdir(), 'ripcode');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const tmpFile = path.join(tmpDir, `_rip_${Date.now()}.js`);

  try {
    fs.writeFileSync(tmpFile, js);
    execSync(`node "${tmpFile}"`, { stdio: 'inherit', cwd: path.dirname(filePath) });
  } catch (err) {
    if (err.status) process.exit(err.status);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

function cmdBuild(args) {
  if (args.length === 0) {
    console.error('Usage: rip build <file.rip> [-o output.js]');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  const js = compileFile(filePath);

  // Determine output path
  let outPath;
  const oIdx = args.indexOf('-o');
  if (oIdx !== -1 && args[oIdx + 1]) {
    outPath = path.resolve(args[oIdx + 1]);
  } else {
    outPath = filePath.replace(/\.rip$/, '.js');
  }

  fs.writeFileSync(outPath, js);
  console.log(`\x1b[32m\u{1F918} Built:\x1b[0m ${outPath}`);

  // 20% chance build celebration
  if (Math.random() < 0.2) {
    const msg = BUILD_CELEBRATIONS[Math.floor(Math.random() * BUILD_CELEBRATIONS.length)];
    console.log(`\x1b[35m${msg}\x1b[0m`);
  }
}

function cmdInit(args) {
  const name = args[0] || 'my-rip-project';
  const dir = path.resolve(name);

  if (fs.existsSync(dir)) {
    console.error(`Directory already exists: ${dir}`);
    process.exit(1);
  }

  fs.mkdirSync(dir, { recursive: true });

  // package.json
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name,
    version: '0.1.0',
    description: 'A RipCode project',
    scripts: {
      start: 'rip run main.rip',
      build: 'rip build main.rip',
    },
  }, null, 2) + '\n');

  // main.rip
  fs.writeFileSync(path.join(dir, 'main.rip'), `// ${name} — built with RipCode\n\nsay "Hello from ${name}!"\n`);

  console.log(`\x1b[32m\u{1F918} Project created:\x1b[0m ${dir}`);
  console.log(`  cd ${name} && rip run main.rip`);
}

function cmdVersion() {
  const tagline = VERSION_TAGLINES[Math.floor(Math.random() * VERSION_TAGLINES.length)];
  console.log(`RipCode v${VERSION}`);
  console.log(`\x1b[2m${tagline}\x1b[0m`);
}

function cmdSolo() {
  for (const frame of SOLO_FRAMES) {
    process.stdout.write('\x1b[2J\x1b[H'); // clear screen
    console.log(frame);
    sleep(500);
  }
  console.log('\x1b[32m  Solo complete. The crowd goes wild.\x1b[0m\n');
}

function cmdLore() {
  const text = LORE_TEXT;
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    if (text[i] !== ' ' && text[i] !== '\x1b') {
      sleep(20);
    }
    // Skip ANSI escape sequence delays
    if (text[i] === '\x1b') {
      while (i < text.length && text[i] !== 'm') {
        i++;
        process.stdout.write(text[i]);
      }
    }
  }
  console.log('');
}

function cmdNoise() {
  console.log('\n\x1b[1m  NOISE LEVELS\x1b[0m\n');
  for (const bar of NOISE_BARS) {
    console.log(bar);
  }
  console.log('');
}

function cmd666() {
  console.log(HORNS_666);
}

function cmdCredits() {
  for (const line of CREDITS) {
    console.log(line);
    sleep(300);
  }
}

main();
