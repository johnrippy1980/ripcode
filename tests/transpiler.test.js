'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { tokenize } = require('../src/lexer');
const { parse } = require('../src/parser');
const { transpile } = require('../src/transpiler');

function compile(code) {
  const tokens = tokenize(code);
  const ast = parse(tokens, code);
  return transpile(ast);
}

function assertContains(output, expected) {
  assert.ok(output.includes(expected), `Expected output to contain:\n  "${expected}"\n\nGot:\n  "${output}"`);
}

describe('Transpiler', () => {
  it('transpiles forge to let', () => {
    const js = compile('forge x = 42');
    assertContains(js, 'let x = 42;');
  });

  it('transpiles lock to const', () => {
    const js = compile('lock PI = 3.14');
    assertContains(js, 'const PI = 3.14;');
  });

  it('transpiles rip to destructuring', () => {
    const js = compile('rip a, b from obj');
    assertContains(js, 'const { a, b } = obj;');
  });

  it('transpiles rip from array', () => {
    const js = compile('rip a, b from [1, 2]');
    assertContains(js, 'const [a, b] = [1, 2];');
  });

  it('transpiles riff to function (arrow body)', () => {
    const js = compile('riff add(a, b) -> a + b');
    assertContains(js, 'function add(a, b) { return (a + b); }');
  });

  it('transpiles riff to function (block body)', () => {
    const js = compile('riff greet(name) {\n  say name\n}');
    assertContains(js, 'function greet(name) {');
    assertContains(js, 'say(name);');
  });

  it('transpiles noise levels', () => {
    const js = compile('say "hello"');
    assertContains(js, 'say("hello");');
  });

  it('transpiles shred to for-of', () => {
    const js = compile('shred items as item {\n  say item\n}');
    assertContains(js, 'for (const item of items) {');
  });

  it('transpiles pipeline to __ripPipe', () => {
    const js = compile('forge r = 5 ~> double');
    assertContains(js, '__ripPipe(5, double)');
  });

  it('transpiles lambda', () => {
    const js = compile('forge fn = |x| -> x * 2');
    assertContains(js, '(x) => (x * 2)');
  });

  it('transpiles brace/recover to try/catch', () => {
    const js = compile('brace {\n  say "try"\n} recover err {\n  say err\n}');
    assertContains(js, 'try {');
    assertContains(js, '} catch (err) {');
  });

  it('transpiles if/else', () => {
    const js = compile('if x > 5 {\n  say "big"\n} else {\n  say "small"\n}');
    assertContains(js, 'if ((x > 5)) {');
    assertContains(js, '} else {');
  });

  it('transpiles while loop', () => {
    const js = compile('while x > 0 {\n  forge x = x - 1\n}');
    assertContains(js, 'while ((x > 0)) {');
  });

  it('transpiles grab to require', () => {
    const js = compile('grab { readFile } from "fs"');
    assertContains(js, "const { readFile } = require('fs');");
  });

  it('transpiles drop to module.exports', () => {
    const js = compile('drop myFunc');
    assertContains(js, 'module.exports.myFunc = myFunc;');
  });

  it('transpiles mosh to __ripMosh', () => {
    const js = compile('mosh { task1(), task2() } -> results');
    assertContains(js, 'const results = await __ripMosh([task1(), task2()]);');
  });

  it('transpiles array literals', () => {
    const js = compile('forge arr = [1, 2, 3]');
    assertContains(js, 'let arr = [1, 2, 3];');
  });

  it('transpiles object literals', () => {
    const js = compile('forge obj = { name: "rip" }');
    assertContains(js, 'let obj = { name: "rip" };');
  });

  it('injects runtime require when needed', () => {
    const js = compile('say "hello"');
    assertContains(js, "require('");
    assertContains(js, "runtime')");
  });

  it('does not inject runtime when not needed', () => {
    const js = compile('forge x = 42');
    assert.ok(!js.includes('require('), 'Should not include runtime require');
  });

  it('transpiles chained pipeline', () => {
    const js = compile('forge r = 5 ~> a ~> b ~> c');
    assertContains(js, '__ripPipe(5, a, b, c)');
  });

  it('transpiles return statement', () => {
    const js = compile('riff foo() {\n  return 42\n}');
    assertContains(js, 'return 42;');
  });
});
