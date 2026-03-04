'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { tokenize, TokenType } = require('../src/lexer');

describe('Lexer', () => {
  it('tokenizes keywords', () => {
    const tokens = tokenize('forge lock rip riff shred');
    const types = tokens.filter(t => t.type !== TokenType.EOF).map(t => t.type);
    assert.deepStrictEqual(types, [
      TokenType.FORGE, TokenType.LOCK, TokenType.RIP, TokenType.RIFF, TokenType.SHRED,
    ]);
  });

  it('tokenizes numbers', () => {
    const tokens = tokenize('42 3.14');
    assert.strictEqual(tokens[0].type, TokenType.NUMBER);
    assert.strictEqual(tokens[0].value, '42');
    assert.strictEqual(tokens[1].type, TokenType.NUMBER);
    assert.strictEqual(tokens[1].value, '3.14');
  });

  it('tokenizes strings', () => {
    const tokens = tokenize('"hello world"');
    assert.strictEqual(tokens[0].type, TokenType.STRING);
    assert.strictEqual(tokens[0].value, 'hello world');
  });

  it('tokenizes interpolated strings', () => {
    const tokens = tokenize('"hello ${name}"');
    assert.strictEqual(tokens[0].type, TokenType.STRING);
    assert.strictEqual(tokens[0].value.interpolated, true);
    assert.strictEqual(tokens[0].value.parts.length, 2);
    assert.strictEqual(tokens[0].value.parts[0].value, 'hello ');
    assert.strictEqual(tokens[0].value.parts[1].value, 'name');
  });

  it('tokenizes operators', () => {
    const tokens = tokenize('~> -> == != <= >= && ||');
    const types = tokens.filter(t => t.type !== TokenType.EOF && t.type !== TokenType.NEWLINE).map(t => t.type);
    assert.deepStrictEqual(types, [
      TokenType.PIPELINE, TokenType.ARROW, TokenType.EQEQ, TokenType.NEQ,
      TokenType.LTE, TokenType.GTE, TokenType.AMPAMP, TokenType.PIPEPIPE,
    ]);
  });

  it('tokenizes pipe for lambdas', () => {
    const tokens = tokenize('|x| -> x * 2');
    assert.strictEqual(tokens[0].type, TokenType.PIPE);
    assert.strictEqual(tokens[1].type, TokenType.IDENTIFIER);
    assert.strictEqual(tokens[2].type, TokenType.PIPE);
  });

  it('skips comments', () => {
    const tokens = tokenize('forge x = 10 // this is a comment\nforge y = 20');
    const idents = tokens.filter(t => t.type === TokenType.IDENTIFIER);
    assert.strictEqual(idents.length, 2);
    assert.strictEqual(idents[0].value, 'x');
    assert.strictEqual(idents[1].value, 'y');
  });

  it('skips multiline comments', () => {
    const tokens = tokenize('forge /* skip this */ x = 5');
    const idents = tokens.filter(t => t.type === TokenType.IDENTIFIER);
    assert.strictEqual(idents.length, 1);
    assert.strictEqual(idents[0].value, 'x');
  });

  it('tracks line numbers', () => {
    const tokens = tokenize('forge x = 1\nforge y = 2');
    const forges = tokens.filter(t => t.type === TokenType.FORGE);
    assert.strictEqual(forges[0].line, 1);
    assert.strictEqual(forges[1].line, 2);
  });

  it('throws on unterminated string', () => {
    assert.throws(() => tokenize('"hello'), /Unterminated string/);
  });

  it('tokenizes delimiters', () => {
    const tokens = tokenize('(){}[],.:;');
    const types = tokens.filter(t => t.type !== TokenType.EOF).map(t => t.type);
    assert.deepStrictEqual(types, [
      TokenType.LPAREN, TokenType.RPAREN, TokenType.LBRACE, TokenType.RBRACE,
      TokenType.LBRACKET, TokenType.RBRACKET, TokenType.COMMA, TokenType.DOT,
      TokenType.COLON, TokenType.SEMICOLON,
    ]);
  });

  it('tokenizes noise keywords', () => {
    const tokens = tokenize('whisper say yell scream');
    const types = tokens.filter(t => t.type !== TokenType.EOF).map(t => t.type);
    assert.deepStrictEqual(types, [
      TokenType.WHISPER, TokenType.SAY, TokenType.YELL, TokenType.SCREAM,
    ]);
  });

  it('tokenizes spread operator', () => {
    const tokens = tokenize('...args');
    assert.strictEqual(tokens[0].type, TokenType.SPREAD);
    assert.strictEqual(tokens[1].type, TokenType.IDENTIFIER);
  });
});
