#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const https = require('https');
const { tokenize } = require('../src/lexer');
const { parse } = require('../src/parser');
const { transpile } = require('../src/transpiler');
const { RipCodeError } = require('../src/errors');
const {
  SOLO_FRAMES, HORNS_666, CREDITS, LORE_TEXT, NOISE_BARS,
  WELCOME, VERSION_TAGLINES, GOLDEN_BANNER, BUILD_CELEBRATIONS,
} = require('../src/ascii');
const { isFirstRun, markFirstRunComplete } = require('../src/firstrun');
const { getHolidayMessage } = require('../src/holidays');

const VERSION = '0.2.1';

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

  // Holiday easter eggs
  const holiday = getHolidayMessage();
  if (holiday) {
    holiday.message.forEach(line => console.log(line));
    if (holiday.url) {
      try {
        const { platform } = process;
        if (platform === 'darwin') execSync(`open "${holiday.url}"`, { stdio: 'ignore' });
        else if (platform === 'win32') execSync(`start "" "${holiday.url}"`, { stdio: 'ignore' });
        else execSync(`xdg-open "${holiday.url}"`, { stdio: 'ignore' });
      } catch {}
    }
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
    case 'unleash': return cmdUnleash();
    case 'quake': return cmdQuake();
    case 'hierarchy': return cmdHierarchy();
    case 'battle': return cmdBattle(args.slice(1));
    case 'repl': return cmdRepl();
    case 'sacrifice': return cmdSacrifice(args.slice(1));
    case 'resurrect': return cmdResurrect(args.slice(1));
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

function cmdUnleash() {
  const url = 'https://actor-arsenal-site.vercel.app/';
  console.log('');
  console.log('\x1b[31m\x1b[1m  Unleashing the arsenal...\x1b[0m');
  console.log('');
  console.log('\x1b[33m     \\m/  \\m/  \\m/  \\m/  \\m/\x1b[0m');
  console.log('');
  console.log(`\x1b[2m  Opening: ${url}\x1b[0m`);
  console.log('');

  // Cross-platform browser open
  const { platform } = process;
  try {
    if (platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else if (platform === 'win32') {
      execSync(`start "" "${url}"`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
    }
    console.log('\x1b[32m  Volume up. \\m/\x1b[0m');
  } catch {
    console.log(`\x1b[2m  Couldn't open browser. Visit manually: ${url}\x1b[0m`);
  }
  console.log('');
}

function cmdQuake() {
  if (process.platform !== 'darwin') {
    console.log('\x1b[33m  Music playback requires macOS. Opening the site instead...\x1b[0m');
    const url = 'https://zapier-quake-site.vercel.app/';
    try {
      if (process.platform === 'win32') {
        execSync(`start "" "${url}"`, { stdio: 'ignore' });
      } else {
        execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
      }
    } catch {
      console.log(`\x1b[2m  Visit: ${url}\x1b[0m`);
    }
    return;
  }

  const os = require('os');
  const ripcodeDir = path.join(os.homedir(), '.ripcode');
  const audioFile = path.join(ripcodeDir, 'quake-theme.mp3');
  const audioUrl = 'https://zapier-quake-site.vercel.app/audio/quake-theme.mp3';

  console.log('');
  console.log('\x1b[33m\x1b[1m  ===============================\x1b[0m');
  console.log('\x1b[33m\x1b[1m   Q U A K E   T H E M E\x1b[0m');
  console.log('\x1b[33m\x1b[1m   Nine Inch Nails / Trent Reznor\x1b[0m');
  console.log('\x1b[33m\x1b[1m  ===============================\x1b[0m');
  console.log('');

  if (fs.existsSync(audioFile)) {
    playQuakeTheme(audioFile);
    return;
  }

  // Download on first use
  console.log('\x1b[2m  Downloading theme (first time only)...\x1b[0m');
  if (!fs.existsSync(ripcodeDir)) fs.mkdirSync(ripcodeDir, { recursive: true });

  const file = fs.createWriteStream(audioFile);
  const request = (url) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        request(res.headers.location);
        return;
      }
      if (res.statusCode !== 200) {
        console.log(`\x1b[31m  Download failed (HTTP ${res.statusCode})\x1b[0m`);
        try { fs.unlinkSync(audioFile); } catch {}
        return;
      }
      const total = parseInt(res.headers['content-length'], 10);
      let downloaded = 0;
      res.on('data', (chunk) => {
        downloaded += chunk.length;
        file.write(chunk);
        if (total) {
          const pct = Math.round((downloaded / total) * 100);
          process.stdout.write(`\r\x1b[2m  Downloading... ${pct}%\x1b[0m`);
        }
      });
      res.on('end', () => {
        file.end();
        console.log('\r\x1b[2m  Download complete.       \x1b[0m');
        playQuakeTheme(audioFile);
      });
    }).on('error', (err) => {
      console.log(`\x1b[31m  Download error: ${err.message}\x1b[0m`);
      try { fs.unlinkSync(audioFile); } catch {}
    });
  };
  request(audioUrl);
}

function playQuakeTheme(audioFile) {
  console.log('\x1b[35m  Playing... (Ctrl+C to stop)\x1b[0m');
  console.log('');
  console.log('\x1b[2m  \\m/ >_< \\m/\x1b[0m');
  console.log('');

  const player = spawn('afplay', [audioFile], { stdio: 'ignore' });

  process.on('SIGINT', () => {
    player.kill();
    console.log('\n\x1b[2m  Theme stopped. Silence falls.\x1b[0m');
    process.exit(0);
  });

  player.on('close', () => {
    console.log('\x1b[2m  Track ended.\x1b[0m');
  });
}

// ============================================================
//  rip hierarchy — DOOM-style boss stats for your project
// ============================================================

function scanDir(dir, ext) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      if (entry.isDirectory()) {
        results.push(...scanDir(full, ext));
      } else if (entry.name.endsWith(ext)) {
        results.push(full);
      }
    }
  } catch {}
  return results;
}

function hpBar(current, max, width = 20) {
  const filled = Math.round((current / max) * width);
  const bar = '\x1b[31m' + '\u2588'.repeat(filled) + '\x1b[2m' + '\u2591'.repeat(width - filled) + '\x1b[0m';
  return bar;
}

function cmdHierarchy() {
  const cwd = process.cwd();
  const ripFiles = scanDir(cwd, '.rip');
  const jsFiles = scanDir(cwd, '.js');

  let totalLines = 0;
  let totalFunctions = 0;
  let totalPipelines = 0;
  let totalScreams = 0;

  for (const f of [...ripFiles, ...jsFiles]) {
    try {
      const src = fs.readFileSync(f, 'utf-8');
      const lines = src.split('\n');
      totalLines += lines.length;
      totalFunctions += (src.match(/\briff\b/g) || []).length + (src.match(/\bfunction\b/g) || []).length;
      totalPipelines += (src.match(/~>/g) || []).length;
      totalScreams += (src.match(/\bscream\b/g) || []).length;
    } catch {}
  }

  // Check for node_modules
  let nmSize = 0;
  const nmPath = path.join(cwd, 'node_modules');
  if (fs.existsSync(nmPath)) {
    try {
      const out = execSync(`du -sk "${nmPath}" 2>/dev/null`).toString();
      nmSize = parseInt(out.split('\t')[0], 10) || 0;
    } catch { nmSize = 999999; }
  }

  const maxHP = Math.max(totalLines, totalFunctions * 100, totalPipelines * 200, nmSize, 1);

  console.log('');
  console.log('\x1b[31m\x1b[1m  ========================================\x1b[0m');
  console.log('\x1b[31m\x1b[1m   D U N G E O N   H I E R A R C H Y\x1b[0m');
  console.log('\x1b[31m\x1b[1m  ========================================\x1b[0m');
  console.log('');
  console.log(`\x1b[2m  Scanning: ${cwd}\x1b[0m`);
  console.log(`\x1b[2m  Found: ${ripFiles.length} .rip files, ${jsFiles.length} .js files\x1b[0m`);
  console.log('');

  const enemies = [
    { name: 'Source Lines', title: 'THE HORDE', hp: totalLines, emoji: '\x1b[33m' },
    { name: 'Functions', title: 'RIFF LORDS', hp: totalFunctions * 100, emoji: '\x1b[36m' },
    { name: 'Pipelines', title: 'CHAIN DEMONS', hp: totalPipelines * 200, emoji: '\x1b[35m' },
    { name: 'Screams', title: 'BANSHEES', hp: totalScreams * 300, emoji: '\x1b[31m' },
  ];

  for (const e of enemies) {
    const displayHP = e.hp || 0;
    console.log(`  ${e.emoji}\x1b[1m${e.title}\x1b[0m ${e.emoji}(${e.name})\x1b[0m`);
    console.log(`  HP: ${hpBar(displayHP, maxHP)} ${displayHP}`);
    console.log('');
    sleep(200);
  }

  if (nmSize > 0) {
    console.log('\x1b[31m\x1b[1m  ----------------------------------------\x1b[0m');
    console.log('');
    console.log('\x1b[31m\x1b[1m  >>>  F I N A L   B O S S  <<<\x1b[0m');
    console.log('');
    console.log('\x1b[31m\x1b[1m  node_modules\x1b[0m');
    console.log(`  HP: ${hpBar(1, 1, 30)} \x1b[31m${Math.round(nmSize / 1024)} MB\x1b[0m`);
    console.log('');
    console.log('\x1b[2m  "You cannot kill what was never alive."\x1b[0m');
    console.log('');
  } else {
    console.log('\x1b[32m  No node_modules detected. You are free.\x1b[0m');
    console.log('');
  }
}

// ============================================================
//  rip battle <file1.rip> <file2.rip> — two files fight
// ============================================================

function analyzeFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf-8');
  const lines = src.split('\n');
  return {
    name: path.basename(filePath),
    loc: lines.length,
    functions: (src.match(/\briff\b/g) || []).length,
    pipelines: (src.match(/~>/g) || []).length,
    screams: (src.match(/\bscream\b/g) || []).length,
    loops: (src.match(/\bshred\b/g) || []).length + (src.match(/\bwhile\b/g) || []).length,
    imports: (src.match(/\bgrab\b/g) || []).length,
  };
}

function cmdBattle(args) {
  if (args.length < 2) {
    console.error('Usage: rip battle <file1.rip> <file2.rip>');
    process.exit(1);
  }

  const f1 = path.resolve(args[0]);
  const f2 = path.resolve(args[1]);
  if (!fs.existsSync(f1)) { console.error(`File not found: ${f1}`); process.exit(1); }
  if (!fs.existsSync(f2)) { console.error(`File not found: ${f2}`); process.exit(1); }

  const a = analyzeFile(f1);
  const b = analyzeFile(f2);

  console.log('');
  console.log('\x1b[31m\x1b[1m  ========================================\x1b[0m');
  console.log('\x1b[31m\x1b[1m        M O R T A L   R I P C O D E\x1b[0m');
  console.log('\x1b[31m\x1b[1m  ========================================\x1b[0m');
  console.log('');
  sleep(500);
  console.log(`\x1b[36m\x1b[1m    ${a.name}\x1b[0m   \x1b[31mvs\x1b[0m   \x1b[35m\x1b[1m${b.name}\x1b[0m`);
  console.log('');
  sleep(500);

  const rounds = [
    { stat: 'loc', label: 'Lines of Code', verb: 'overwhelms' },
    { stat: 'functions', label: 'Riff Count', verb: 'outshreds' },
    { stat: 'pipelines', label: 'Pipeline Depth', verb: 'outflows' },
    { stat: 'screams', label: 'Scream Power', verb: 'deafens' },
    { stat: 'loops', label: 'Loop Fury', verb: 'dizzies' },
    { stat: 'imports', label: 'Arsenal Size', verb: 'outguns' },
  ];

  let scoreA = 0;
  let scoreB = 0;

  for (const round of rounds) {
    const vA = a[round.stat];
    const vB = b[round.stat];
    let winner, wName, lName;
    if (vA > vB) { winner = 'A'; scoreA++; wName = a.name; lName = b.name; }
    else if (vB > vA) { winner = 'B'; scoreB++; wName = b.name; lName = a.name; }
    else { wName = 'TIE'; }

    const color = winner === 'A' ? '\x1b[36m' : winner === 'B' ? '\x1b[35m' : '\x1b[33m';
    const result = wName === 'TIE'
      ? `\x1b[33m  DRAW!\x1b[0m`
      : `${color}  ${wName} ${round.verb} ${lName}!\x1b[0m`;

    console.log(`\x1b[1m  Round: ${round.label}\x1b[0m`);
    console.log(`    ${a.name}: ${vA}  |  ${b.name}: ${vB}`);
    console.log(`  ${result}`);
    console.log('');
    sleep(400);
  }

  console.log('\x1b[1m  ----------------------------------------\x1b[0m');
  console.log('');

  if (scoreA > scoreB) {
    console.log(`\x1b[36m\x1b[1m  WINNER: ${a.name} (${scoreA}-${scoreB})\x1b[0m`);
    console.log('\x1b[36m  FATALITY. \\m/\x1b[0m');
  } else if (scoreB > scoreA) {
    console.log(`\x1b[35m\x1b[1m  WINNER: ${b.name} (${scoreB}-${scoreA})\x1b[0m`);
    console.log('\x1b[35m  FATALITY. \\m/\x1b[0m');
  } else {
    console.log('\x1b[33m\x1b[1m  DRAW! Both fighters stand.\x1b[0m');
    console.log('\x1b[33m  Mutual respect. \\m/\x1b[0m');
  }
  console.log('');
}

// ============================================================
//  rip repl — interactive RipCode REPL with Konami code
// ============================================================

function cmdRepl() {
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[35mrip>\x1b[0m ',
  });

  console.log('');
  console.log('\x1b[35m\x1b[1m  RipCode REPL v' + VERSION + '\x1b[0m');
  console.log('\x1b[2m  Type RipCode expressions. "exit" to quit.\x1b[0m');
  console.log('');

  // Konami code tracking: uuddlrlrba
  const KONAMI = 'uuddlrlrba';
  let konamiBuffer = '';

  // Enable raw mode for keypress detection while keeping readline working
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);

    process.stdin.on('keypress', (ch, key) => {
      if (!key) return;

      const map = {
        up: 'u', down: 'd', left: 'l', right: 'r',
      };

      if (map[key.name]) {
        konamiBuffer += map[key.name];
      } else if (key.name === 'b' || key.name === 'a') {
        konamiBuffer += key.name;
      } else {
        konamiBuffer = '';
      }

      // Keep buffer trimmed
      if (konamiBuffer.length > KONAMI.length) {
        konamiBuffer = konamiBuffer.slice(-KONAMI.length);
      }

      if (konamiBuffer === KONAMI) {
        konamiBuffer = '';
        triggerKonami();
      }
    });
  }

  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim();
    if (input === 'exit' || input === 'quit') {
      console.log('\x1b[2m  \\m/ Later.\x1b[0m');
      process.exit(0);
    }

    if (!input) {
      rl.prompt();
      return;
    }

    try {
      const tokens = tokenize(input);
      const ast = parse(tokens, input);
      const js = transpile(ast);
      // Execute the transpiled code
      const tmpDir = path.join(require('os').tmpdir(), 'ripcode');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpFile = path.join(tmpDir, `_repl_${Date.now()}.js`);
      fs.writeFileSync(tmpFile, js);
      try {
        execSync(`node "${tmpFile}"`, { stdio: 'inherit' });
      } catch {}
      try { fs.unlinkSync(tmpFile); } catch {}
    } catch (err) {
      if (err instanceof RipCodeError) {
        console.error(err.format());
      } else {
        console.error(`\x1b[31m  ${err.message}\x1b[0m`);
      }
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n\x1b[2m  \\m/ Later.\x1b[0m');
    process.exit(0);
  });

  function triggerKonami() {
    console.log('');
    console.log('\x1b[33m\x1b[1m  ============================================\x1b[0m');
    console.log('\x1b[33m\x1b[1m   K O N A M I   C O D E   A C T I V A T E D\x1b[0m');
    console.log('\x1b[33m\x1b[1m  ============================================\x1b[0m');
    console.log('');
    console.log('\x1b[31m          \\m/  \\m/  \\m/\x1b[0m');
    console.log('\x1b[36m       30 EXTRA LIVES GRANTED\x1b[0m');
    console.log('\x1b[35m       ALL WEAPONS UNLOCKED\x1b[0m');
    console.log('\x1b[33m       GOD MODE: ENABLED\x1b[0m');
    console.log('');
    console.log('\x1b[2m  "Up Up Down Down Left Right Left Right B A"\x1b[0m');
    console.log('');

    // Try to play quake theme if cached
    const os = require('os');
    const audioFile = path.join(os.homedir(), '.ripcode', 'quake-theme.mp3');
    if (process.platform === 'darwin' && fs.existsSync(audioFile)) {
      console.log('\x1b[35m  Quake theme activated. \\m/\x1b[0m');
      console.log('');
      spawn('afplay', [audioFile], { stdio: 'ignore', detached: true }).unref();
    }

    rl.prompt();
  }
}

// ============================================================
//  rip sacrifice <file> — dramatic file deletion (recoverable)
//  rip resurrect <file> — bring a file back from the graveyard
// ============================================================

function cmdSacrifice(args) {
  if (args.length === 0) {
    console.error('Usage: rip sacrifice <file>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`\x1b[31m  Cannot sacrifice what does not exist: ${filePath}\x1b[0m`);
    process.exit(1);
  }

  const os = require('os');
  const graveyard = path.join(os.homedir(), '.ripcode', 'graveyard');
  if (!fs.existsSync(graveyard)) fs.mkdirSync(graveyard, { recursive: true });

  const fileName = path.basename(filePath);
  const timestamp = Date.now();
  const graveName = `${timestamp}_${fileName}`;
  const gravePath = path.join(graveyard, graveName);

  // The ceremony
  console.log('');
  sleep(300);

  console.log('\x1b[31m\x1b[1m  The altar is prepared...\x1b[0m');
  sleep(500);

  console.log('');
  console.log('\x1b[33m        )  (');
  console.log('       (   ) )');
  console.log('        ) ( (');
  console.log('       ______');
  console.log('      |      |');
  console.log('      |      |');
  console.log('      |______|');
  console.log('   ___/      \\___\x1b[0m');
  sleep(600);

  console.log('');
  console.log('\x1b[31m\x1b[1m    _____\x1b[0m');
  console.log('\x1b[31m\x1b[1m   /     \\\x1b[0m');
  console.log('\x1b[31m\x1b[1m  | x   x |\x1b[0m');
  console.log('\x1b[31m\x1b[1m   \\ --- /\x1b[0m');
  console.log('\x1b[31m\x1b[1m    |||||\x1b[0m');
  sleep(400);

  console.log('');
  console.log(`\x1b[35m  "${fileName}" has been offered to the void.\x1b[0m`);
  sleep(300);

  // Actually move the file
  fs.renameSync(filePath, gravePath);

  console.log('');
  console.log('\x1b[2m  +---------------------------------+\x1b[0m');
  console.log('\x1b[2m  |          R . I . P .            |\x1b[0m');
  console.log(`\x1b[2m  |  ${fileName.substring(0, 29).padEnd(29)}  |\x1b[0m`);
  console.log(`\x1b[2m  |  ${new Date().toLocaleDateString().padEnd(29)}  |\x1b[0m`);
  console.log('\x1b[2m  |  "Gone but not forgotten"       |\x1b[0m');
  console.log('\x1b[2m  +---------------------------------+\x1b[0m');
  console.log('');
  console.log('\x1b[2m  (Use "rip resurrect ' + fileName + '" to bring it back)\x1b[0m');
  console.log('');
}

function cmdResurrect(args) {
  if (args.length === 0) {
    // List graveyard contents
    const os = require('os');
    const graveyard = path.join(os.homedir(), '.ripcode', 'graveyard');
    if (!fs.existsSync(graveyard)) {
      console.log('\x1b[2m  The graveyard is empty. Nothing to resurrect.\x1b[0m');
      return;
    }
    const files = fs.readdirSync(graveyard);
    if (files.length === 0) {
      console.log('\x1b[2m  The graveyard is empty. Nothing to resurrect.\x1b[0m');
      return;
    }
    console.log('');
    console.log('\x1b[35m\x1b[1m  THE GRAVEYARD\x1b[0m');
    console.log('');
    for (const f of files) {
      const ts = parseInt(f.split('_')[0], 10);
      const name = f.substring(f.indexOf('_') + 1);
      const date = isNaN(ts) ? '???' : new Date(ts).toLocaleString();
      console.log(`  \x1b[2m${date}\x1b[0m  ${name}`);
    }
    console.log('');
    console.log('\x1b[2m  Usage: rip resurrect <filename>\x1b[0m');
    console.log('');
    return;
  }

  const targetName = args[0];
  const os = require('os');
  const graveyard = path.join(os.homedir(), '.ripcode', 'graveyard');
  if (!fs.existsSync(graveyard)) {
    console.log('\x1b[31m  The graveyard is empty. Nothing to resurrect.\x1b[0m');
    return;
  }

  // Find most recent match
  const files = fs.readdirSync(graveyard).filter(f => f.endsWith('_' + targetName)).sort().reverse();
  if (files.length === 0) {
    console.log(`\x1b[31m  "${targetName}" was not found in the graveyard.\x1b[0m`);
    return;
  }

  const graveFile = files[0];
  const gravePath = path.join(graveyard, graveFile);
  const restorePath = path.resolve(targetName);

  if (fs.existsSync(restorePath)) {
    console.log(`\x1b[31m  "${targetName}" already exists. Remove it first or choose a different name.\x1b[0m`);
    return;
  }

  fs.renameSync(gravePath, restorePath);

  console.log('');
  console.log('\x1b[32m\x1b[1m  RESURRECTION COMPLETE\x1b[0m');
  console.log('');
  console.log('\x1b[33m     \\m/  >_<  \\m/\x1b[0m');
  console.log('');
  console.log(`\x1b[32m  "${targetName}" has returned from the dead.\x1b[0m`);
  console.log(`\x1b[2m  Restored to: ${restorePath}\x1b[0m`);
  console.log('');
}

main();
