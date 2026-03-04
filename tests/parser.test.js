'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { tokenize } = require('../src/lexer');
const { parse } = require('../src/parser');

function parseCode(code) {
  return parse(tokenize(code), code);
}

describe('Parser', () => {
  it('parses forge declaration', () => {
    const ast = parseCode('forge x = 42');
    assert.strictEqual(ast.body[0].type, 'ForgeDecl');
    assert.strictEqual(ast.body[0].name, 'x');
    assert.strictEqual(ast.body[0].value.type, 'NumericLiteral');
    assert.strictEqual(ast.body[0].value.value, 42);
  });

  it('parses lock declaration', () => {
    const ast = parseCode('lock PI = 3.14');
    assert.strictEqual(ast.body[0].type, 'LockDecl');
    assert.strictEqual(ast.body[0].name, 'PI');
    assert.strictEqual(ast.body[0].value.value, 3.14);
  });

  it('parses rip (destructuring)', () => {
    const ast = parseCode('rip a, b from obj');
    assert.strictEqual(ast.body[0].type, 'RipExpr');
    assert.deepStrictEqual(ast.body[0].names, ['a', 'b']);
    assert.strictEqual(ast.body[0].source.name, 'obj');
  });

  it('parses riff with arrow body', () => {
    const ast = parseCode('riff add(a, b) -> a + b');
    assert.strictEqual(ast.body[0].type, 'RiffDecl');
    assert.strictEqual(ast.body[0].name, 'add');
    assert.strictEqual(ast.body[0].params.length, 2);
    assert.strictEqual(ast.body[0].body.type, 'ReturnStatement');
  });

  it('parses riff with block body', () => {
    const ast = parseCode('riff greet(name) {\n  say name\n}');
    assert.strictEqual(ast.body[0].type, 'RiffDecl');
    assert.strictEqual(ast.body[0].body.type, 'Block');
    assert.strictEqual(ast.body[0].body.body.length, 1);
  });

  it('parses noise statements', () => {
    const ast = parseCode('say "hello"');
    assert.strictEqual(ast.body[0].type, 'NoiseStmt');
    assert.strictEqual(ast.body[0].level, 'say');
  });

  it('parses shred loop', () => {
    const ast = parseCode('shred items as item {\n  say item\n}');
    assert.strictEqual(ast.body[0].type, 'ShredLoop');
    assert.strictEqual(ast.body[0].variable, 'item');
    assert.strictEqual(ast.body[0].iterable.name, 'items');
  });

  it('parses if/else', () => {
    const ast = parseCode('if x > 5 {\n  say "big"\n} else {\n  say "small"\n}');
    assert.strictEqual(ast.body[0].type, 'IfStmt');
    assert.notStrictEqual(ast.body[0].alternate, null);
  });

  it('parses pipeline expression', () => {
    const ast = parseCode('forge r = 5 ~> double ~> addTen');
    const value = ast.body[0].value;
    assert.strictEqual(value.type, 'PipelineExpr');
  });

  it('parses lambda', () => {
    const ast = parseCode('forge fn = |x| -> x * 2');
    const lambda = ast.body[0].value;
    assert.strictEqual(lambda.type, 'Lambda');
    assert.strictEqual(lambda.params.length, 1);
    assert.strictEqual(lambda.body.type, 'ReturnStatement');
  });

  it('parses brace/recover', () => {
    const ast = parseCode('brace {\n  say "try"\n} recover err {\n  say err\n}');
    assert.strictEqual(ast.body[0].type, 'BraceRecover');
    assert.strictEqual(ast.body[0].errorVar, 'err');
  });

  it('parses array literals', () => {
    const ast = parseCode('forge arr = [1, 2, 3]');
    assert.strictEqual(ast.body[0].value.type, 'ArrayLiteral');
    assert.strictEqual(ast.body[0].value.elements.length, 3);
  });

  it('parses object literals', () => {
    const ast = parseCode('forge obj = { name: "rip", version: 1 }');
    assert.strictEqual(ast.body[0].value.type, 'ObjectLiteral');
    assert.strictEqual(ast.body[0].value.properties.length, 2);
  });

  it('parses while loop', () => {
    const ast = parseCode('while x > 0 {\n  x = x - 1\n}');
    assert.strictEqual(ast.body[0].type, 'WhileStmt');
  });

  it('parses grab statement', () => {
    const ast = parseCode('grab { readFile } from "fs"');
    assert.strictEqual(ast.body[0].type, 'GrabStmt');
    assert.deepStrictEqual(ast.body[0].imports, ['readFile']);
    assert.strictEqual(ast.body[0].module, 'fs');
  });

  it('parses drop statement', () => {
    const ast = parseCode('drop myFunc');
    assert.strictEqual(ast.body[0].type, 'DropStmt');
    assert.deepStrictEqual(ast.body[0].exports, ['myFunc']);
  });

  it('parses mosh block', () => {
    const ast = parseCode('mosh { task1(), task2() } -> results');
    assert.strictEqual(ast.body[0].type, 'MoshBlock');
    assert.strictEqual(ast.body[0].tasks.length, 2);
    assert.strictEqual(ast.body[0].resultVar, 'results');
  });

  it('parses function calls', () => {
    const ast = parseCode('add(1, 2)');
    assert.strictEqual(ast.body[0].expression.type, 'CallExpr');
    assert.strictEqual(ast.body[0].expression.args.length, 2);
  });

  it('parses member expressions', () => {
    const ast = parseCode('obj.name');
    assert.strictEqual(ast.body[0].expression.type, 'MemberExpr');
    assert.strictEqual(ast.body[0].expression.property, 'name');
  });

  it('parses nested expressions', () => {
    const ast = parseCode('forge x = (1 + 2) * 3');
    assert.strictEqual(ast.body[0].value.type, 'BinaryExpr');
    assert.strictEqual(ast.body[0].value.op, '*');
  });
});
