```
   ____  _       ____          _
  |  _ \(_)_ __ / ___|___   __| | ___
  | |_) | | '_ \ |   / _ \ / _` |/ _ \
  |  _ <| | |_) | |__| (_) | (_| |  __/
  |_| \_\_| .__/ \____\___/ \__,_|\___|
           |_|
```

# RipCode 🤘

**A destructive-first programming language that transpiles to JavaScript.**

RipCode combines a metal/cyberpunk aesthetic with real programming power. Forge variables, shred through loops, pipe data through riffs, and mosh your async operations — all transpiled to clean, runnable JavaScript.

## Install

```bash
npm install -g ripcode
```

Or try it without installing:

```bash
npx ripcode run hello.rip
```

## Quick Start

```bash
# Create a new project
rip init my-project
cd my-project

# Run it
rip run main.rip

# Or build to JavaScript
rip build main.rip -o out.js
```

## Hello World

```
// hello.rip
say "Hello, world!"

forge name = "RipCode"
say "Welcome to ${name} 🤘"
```

```bash
rip run hello.rip
```

## Language Reference

### Variables & Constants

```
forge x = 10          // let x = 10
lock PI = 3.14        // const PI = 3.14
```

### Destructuring

```
forge obj = { name: "rip", version: 1 }
rip name, version from obj

forge arr = [1, 2, 3]
rip a, b, c from arr
```

### Functions (Riffs)

```
// Single expression (auto-returns)
riff double(x) -> x * 2

// Block body
riff greet(name) {
  forge msg = "Hey, ${name}!"
  say msg
  return msg
}

// Default params + rest
riff log(level = "info", ...args) {
  say level, args
}
```

### Pipeline Operator (~>)

Chain data through functions left-to-right:

```
riff double(x) -> x * 2
riff addTen(x) -> x + 10
riff square(x) -> x * x

forge result = 5 ~> double ~> addTen ~> square
say result  // 400
```

### Noise Levels (Output)

```
whisper "debug info"       // console.debug
say "normal output"        // console.log
yell "warning!"            // console.warn
scream "EVERYTHING BROKE"  // console.error
```

### Loops

```
// For-of loop
forge items = ["guitar", "bass", "drums"]
shred items as item {
  say item
}

// While loop
forge count = 3
while count > 0 {
  say "${count}..."
  count = count - 1
}
```

### Conditionals

```
forge score = 95

if score >= 90 {
  say "A — shredding it!"
} else if score >= 80 {
  say "B — solid riff"
} else {
  yell "Needs practice"
}
```

### Lambdas

```
forge double = |x| -> x * 2
forge add = |a, b| -> a + b

say double(21)   // 42
say add(20, 22)  // 42
```

### Error Handling

```
brace {
  // risky code here
  forge data = riskyOperation()
} recover err {
  scream "Crashed: ${err}"
}
```

### Concurrency (Mosh Pit)

```
mosh {
  fetchUsers(),
  fetchPosts(),
  fetchComments()
} -> results
```

### Imports & Exports

```
// Import
grab { readFile } from "fs"
grab path from "path"

// Export
riff helper() -> "help"
drop helper
drop { helper, anotherFn }
```

### String Interpolation

```
forge name = "world"
forge greeting = "Hello, ${name}!"
forge math = "2 + 2 = ${2 + 2}"
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `rip run <file.rip>` | Transpile and execute |
| `rip build <file.rip> [-o out.js]` | Transpile to JavaScript |
| `rip init [name]` | Scaffold a new project |
| `rip version` | Show version |
| `rip help` | Show help |

## Full Cheat Sheet

| RipCode | JavaScript |
|---------|-----------|
| `forge x = 10` | `let x = 10` |
| `lock PI = 3.14` | `const PI = 3.14` |
| `rip a, b from obj` | `const { a, b } = obj` |
| `riff fn(x) -> x * 2` | `function fn(x) { return x * 2 }` |
| `data ~> fn1 ~> fn2` | `fn2(fn1(data))` |
| `whisper "x"` | `console.debug("x")` |
| `say "x"` | `console.log("x")` |
| `yell "x"` | `console.warn("x")` |
| `scream "x"` | `console.error("x")` |
| `shred arr as x { }` | `for (const x of arr) { }` |
| `brace { } recover { }` | `try { } catch(e) { }` |
| `mosh { } -> r` | `await Promise.all([...])` |
| `grab { x } from "y"` | `const { x } = require("y")` |
| `drop fn` | `module.exports.fn = fn` |
| `\|x\| -> x * 2` | `(x) => x * 2` |

## Error Messages

RipCode has themed error messages:

```
🔥 TRACK SCRATCHED (Syntax Error)
   at line 5, col 12
   Unexpected token 'blah' — expected '}'

💀 GHOST NOTE (Reference Error)
   at line 8
   'userName' doesn't exist in this pit

🎸 BROKEN STRING (String Error)
   at line 3
   Unterminated string — did you forget to close your quotes?
```

## Examples

Check out the `examples/` directory:

- `hello.rip` — Noise levels and basic variables
- `pipeline.rip` — Data pipelines with `~>`
- `mosh.rip` — Loops, conditionals, grade report
- `full-demo.rip` — Complete feature showcase

## How It Works

RipCode is a source-to-source transpiler:

1. **Lexer** (`src/lexer.js`) — Tokenizes `.rip` source code
2. **Parser** (`src/parser.js`) — Recursive descent parser → AST
3. **Transpiler** (`src/transpiler.js`) — AST → JavaScript
4. **Runtime** (`src/runtime.js`) — Helper functions (pipelines, mosh, noise)

Zero dependencies. Pure Node.js.

## License

MIT
