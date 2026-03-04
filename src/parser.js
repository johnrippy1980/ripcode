'use strict';

const { TokenType } = require('./lexer');
const { syntaxError } = require('./errors');

class Parser {
  constructor(tokens, source) {
    this.tokens = tokens;
    this.source = source;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  advance() {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  expect(type, msg) {
    const token = this.peek();
    if (token.type !== type) {
      throw syntaxError(
        msg || `Expected ${type} but got '${token.value || token.type}'`,
        token.line, token.col, this.source
      );
    }
    return this.advance();
  }

  match(type) {
    if (this.peek().type === type) {
      return this.advance();
    }
    return null;
  }

  skipNewlines() {
    while (this.peek().type === TokenType.NEWLINE) this.advance();
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  isStatementEnd() {
    const t = this.peek().type;
    return t === TokenType.NEWLINE || t === TokenType.EOF || t === TokenType.SEMICOLON || t === TokenType.RBRACE;
  }

  consumeStatementEnd() {
    if (this.peek().type === TokenType.SEMICOLON) this.advance();
    this.skipNewlines();
  }

  parse() {
    const body = [];
    this.skipNewlines();
    while (!this.isAtEnd()) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    return { type: 'Program', body };
  }

  parseStatement() {
    this.skipNewlines();
    const token = this.peek();

    switch (token.type) {
      case TokenType.FORGE: return this.parseForge();
      case TokenType.LOCK: return this.parseLock();
      case TokenType.RIP: return this.parseRip();
      case TokenType.RIFF: return this.parseRiff();
      case TokenType.SHRED: return this.parseShred();
      case TokenType.WHISPER:
      case TokenType.SAY:
      case TokenType.YELL:
      case TokenType.SCREAM: return this.parseNoise();
      case TokenType.BRACE: return this.parseBraceRecover();
      case TokenType.MOSH: return this.parseMosh();
      case TokenType.IF: return this.parseIf();
      case TokenType.WHILE: return this.parseWhile();
      case TokenType.GRAB: return this.parseGrab();
      case TokenType.DROP: return this.parseDrop();
      case TokenType.RETURN: return this.parseReturn();
      default: {
        const expr = this.parseExpression();
        this.consumeStatementEnd();
        return { type: 'ExpressionStatement', expression: expr, line: token.line };
      }
    }
  }

  // forge x = 10
  parseForge() {
    const token = this.advance(); // consume 'forge'
    const name = this.expect(TokenType.IDENTIFIER, "Expected variable name after 'forge'").value;
    this.expect(TokenType.ASSIGN, "Expected '=' after variable name");
    const value = this.parseExpression();
    this.consumeStatementEnd();
    return { type: 'ForgeDecl', name, value, line: token.line };
  }

  // lock X = 10
  parseLock() {
    const token = this.advance(); // consume 'lock'
    const name = this.expect(TokenType.IDENTIFIER, "Expected variable name after 'lock'").value;
    this.expect(TokenType.ASSIGN, "Expected '=' after constant name");
    const value = this.parseExpression();
    this.consumeStatementEnd();
    return { type: 'LockDecl', name, value, line: token.line };
  }

  // rip a, b from obj
  // rip a, b from [1, 2, 3]
  parseRip() {
    const token = this.advance(); // consume 'rip'
    const names = [];
    names.push(this.expect(TokenType.IDENTIFIER, "Expected variable name after 'rip'").value);
    while (this.match(TokenType.COMMA)) {
      names.push(this.expect(TokenType.IDENTIFIER, "Expected variable name after ','").value);
    }
    this.expect(TokenType.FROM, "Expected 'from' in rip expression");
    const source = this.parseExpression();
    this.consumeStatementEnd();
    return { type: 'RipExpr', names, source, line: token.line };
  }

  // riff name(params) -> expression
  // riff name(params) { body }
  parseRiff() {
    const token = this.advance(); // consume 'riff'
    const isAsync = false;
    const name = this.expect(TokenType.IDENTIFIER, "Expected function name after 'riff'").value;
    this.expect(TokenType.LPAREN, "Expected '(' after function name");
    const params = this.parseParamList();
    this.expect(TokenType.RPAREN, "Expected ')' after parameters");

    let body;
    if (this.match(TokenType.ARROW)) {
      // Single expression body
      const expr = this.parseExpression();
      body = { type: 'ReturnStatement', value: expr, line: token.line };
      this.consumeStatementEnd();
    } else {
      // Block body
      body = this.parseBlock();
    }
    return { type: 'RiffDecl', name, params, body, async: isAsync, line: token.line };
  }

  parseParamList() {
    const params = [];
    if (this.peek().type !== TokenType.RPAREN) {
      params.push(this.parseParam());
      while (this.match(TokenType.COMMA)) {
        params.push(this.parseParam());
      }
    }
    return params;
  }

  parseParam() {
    if (this.match(TokenType.SPREAD)) {
      const name = this.expect(TokenType.IDENTIFIER, "Expected parameter name after '...'").value;
      return { type: 'RestParam', name };
    }
    const name = this.expect(TokenType.IDENTIFIER, "Expected parameter name").value;
    let defaultValue = null;
    if (this.match(TokenType.ASSIGN)) {
      defaultValue = this.parseExpression();
    }
    return { type: 'Param', name, default: defaultValue };
  }

  // shred items as item { body }
  parseShred() {
    const token = this.advance(); // consume 'shred'
    const iterable = this.parseExpression();
    this.expect(TokenType.AS, "Expected 'as' in shred loop");
    const variable = this.expect(TokenType.IDENTIFIER, "Expected variable name after 'as'").value;
    const body = this.parseBlock();
    return { type: 'ShredLoop', iterable, variable, body, line: token.line };
  }

  // whisper/say/yell/scream expression
  parseNoise() {
    const token = this.advance();
    const level = token.value; // whisper, say, yell, scream
    const args = [this.parseExpression()];
    while (this.match(TokenType.COMMA)) {
      args.push(this.parseExpression());
    }
    this.consumeStatementEnd();
    return { type: 'NoiseStmt', level, args, line: token.line };
  }

  // brace { } recover { }
  parseBraceRecover() {
    const token = this.advance(); // consume 'brace'
    const tryBlock = this.parseBlock();
    this.skipNewlines();
    this.expect(TokenType.RECOVER, "Expected 'recover' after brace block");
    // optional error variable
    let errorVar = null;
    if (this.peek().type === TokenType.IDENTIFIER) {
      errorVar = this.advance().value;
    }
    const catchBlock = this.parseBlock();
    return { type: 'BraceRecover', tryBlock, errorVar, catchBlock, line: token.line };
  }

  // mosh { async1(), async2() } -> results
  parseMosh() {
    const token = this.advance(); // consume 'mosh'
    this.expect(TokenType.LBRACE, "Expected '{' after mosh");
    this.skipNewlines();
    const tasks = [];
    while (this.peek().type !== TokenType.RBRACE) {
      tasks.push(this.parseExpression());
      this.match(TokenType.COMMA);
      this.skipNewlines();
    }
    this.expect(TokenType.RBRACE, "Expected '}' to close mosh block");

    let resultVar = null;
    if (this.match(TokenType.ARROW)) {
      resultVar = this.expect(TokenType.IDENTIFIER, "Expected variable name after '->'").value;
    }
    this.consumeStatementEnd();
    return { type: 'MoshBlock', tasks, resultVar, line: token.line };
  }

  // if condition { body } else { body }
  parseIf() {
    const token = this.advance(); // consume 'if'
    const condition = this.parseExpression();
    const consequent = this.parseBlock();
    let alternate = null;
    this.skipNewlines();
    if (this.match(TokenType.ELSE)) {
      if (this.peek().type === TokenType.IF) {
        alternate = this.parseIf();
      } else {
        alternate = this.parseBlock();
      }
    }
    return { type: 'IfStmt', condition, consequent, alternate, line: token.line };
  }

  // while condition { body }
  parseWhile() {
    const token = this.advance(); // consume 'while'
    const condition = this.parseExpression();
    const body = this.parseBlock();
    return { type: 'WhileStmt', condition, body, line: token.line };
  }

  // grab { x, y } from "module"
  // grab x from "module"
  parseGrab() {
    const token = this.advance(); // consume 'grab'
    const imports = [];
    let destructured = false;

    if (this.match(TokenType.LBRACE)) {
      destructured = true;
      imports.push(this.expect(TokenType.IDENTIFIER, "Expected import name").value);
      while (this.match(TokenType.COMMA)) {
        this.skipNewlines();
        if (this.peek().type === TokenType.RBRACE) break;
        imports.push(this.expect(TokenType.IDENTIFIER, "Expected import name").value);
      }
      this.expect(TokenType.RBRACE, "Expected '}'");
    } else {
      imports.push(this.expect(TokenType.IDENTIFIER, "Expected import name").value);
    }

    this.expect(TokenType.FROM, "Expected 'from' in grab statement");
    const moduleToken = this.expect(TokenType.STRING, "Expected module path string");
    const modulePath = typeof moduleToken.value === 'string' ? moduleToken.value : moduleToken.value.parts.map(p => p.value).join('');
    this.consumeStatementEnd();
    return { type: 'GrabStmt', imports, module: modulePath, destructured, line: token.line };
  }

  // drop fn
  // drop { fn1, fn2 }
  parseDrop() {
    const token = this.advance(); // consume 'drop'
    const exports = [];

    if (this.match(TokenType.LBRACE)) {
      exports.push(this.expect(TokenType.IDENTIFIER, "Expected export name").value);
      while (this.match(TokenType.COMMA)) {
        this.skipNewlines();
        if (this.peek().type === TokenType.RBRACE) break;
        exports.push(this.expect(TokenType.IDENTIFIER, "Expected export name").value);
      }
      this.expect(TokenType.RBRACE, "Expected '}'");
    } else {
      exports.push(this.expect(TokenType.IDENTIFIER, "Expected export name").value);
    }
    this.consumeStatementEnd();
    return { type: 'DropStmt', exports, line: token.line };
  }

  // return expression
  parseReturn() {
    const token = this.advance(); // consume 'return'
    let value = null;
    if (!this.isStatementEnd()) {
      value = this.parseExpression();
    }
    this.consumeStatementEnd();
    return { type: 'ReturnStatement', value, line: token.line };
  }

  // { statements }
  parseBlock() {
    this.skipNewlines();
    this.expect(TokenType.LBRACE, "Expected '{'");
    this.skipNewlines();
    const body = [];
    while (this.peek().type !== TokenType.RBRACE && !this.isAtEnd()) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    this.expect(TokenType.RBRACE, "Expected '}'");
    return { type: 'Block', body };
  }

  // Expression parsing with precedence climbing
  parseExpression() {
    const expr = this.parsePipeline();

    // Assignment: identifier = expression
    if (this.peek().type === TokenType.ASSIGN) {
      this.advance();
      const value = this.parseExpression();
      return { type: 'AssignExpr', target: expr, value, line: expr.line };
    }

    return expr;
  }

  // pipeline: lowest precedence — a ~> b ~> c
  parsePipeline() {
    let left = this.parseLogicalOr();
    while (this.peek().type === TokenType.PIPELINE) {
      this.advance();
      const right = this.parseLogicalOr();
      left = { type: 'PipelineExpr', left, right, line: left.line };
    }
    return left;
  }

  parseLogicalOr() {
    let left = this.parseLogicalAnd();
    while (this.peek().type === TokenType.PIPEPIPE || this.peek().type === TokenType.OR) {
      const op = this.advance().value;
      const right = this.parseLogicalAnd();
      left = { type: 'BinaryExpr', op: '||', left, right, line: left.line };
    }
    return left;
  }

  parseLogicalAnd() {
    let left = this.parseEquality();
    while (this.peek().type === TokenType.AMPAMP || this.peek().type === TokenType.AND) {
      const op = this.advance().value;
      const right = this.parseEquality();
      left = { type: 'BinaryExpr', op: '&&', left, right, line: left.line };
    }
    return left;
  }

  parseEquality() {
    let left = this.parseComparison();
    while (this.peek().type === TokenType.EQEQ || this.peek().type === TokenType.NEQ) {
      const op = this.advance().value;
      const right = this.parseComparison();
      left = { type: 'BinaryExpr', op, left, right, line: left.line };
    }
    return left;
  }

  parseComparison() {
    let left = this.parseAdditive();
    while ([TokenType.LT, TokenType.GT, TokenType.LTE, TokenType.GTE].includes(this.peek().type)) {
      const op = this.advance().value;
      const right = this.parseAdditive();
      left = { type: 'BinaryExpr', op, left, right, line: left.line };
    }
    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.peek().type === TokenType.PLUS || this.peek().type === TokenType.MINUS) {
      const op = this.advance().value;
      const right = this.parseMultiplicative();
      left = { type: 'BinaryExpr', op, left, right, line: left.line };
    }
    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnary();
    while (this.peek().type === TokenType.STAR || this.peek().type === TokenType.SLASH || this.peek().type === TokenType.PERCENT) {
      const op = this.advance().value;
      const right = this.parseUnary();
      left = { type: 'BinaryExpr', op, left, right, line: left.line };
    }
    return left;
  }

  parseUnary() {
    if (this.peek().type === TokenType.BANG || this.peek().type === TokenType.NOT) {
      const token = this.advance();
      const operand = this.parseUnary();
      return { type: 'UnaryExpr', op: '!', operand, line: token.line };
    }
    if (this.peek().type === TokenType.MINUS) {
      const token = this.advance();
      const operand = this.parseUnary();
      return { type: 'UnaryExpr', op: '-', operand, line: token.line };
    }
    if (this.peek().type === TokenType.AWAIT) {
      const token = this.advance();
      const operand = this.parseUnary();
      return { type: 'AwaitExpr', operand, line: token.line };
    }
    return this.parseCallMember();
  }

  parseCallMember() {
    let expr = this.parsePrimary();

    while (true) {
      if (this.peek().type === TokenType.LPAREN) {
        this.advance();
        const args = [];
        if (this.peek().type !== TokenType.RPAREN) {
          args.push(this.parseExpression());
          while (this.match(TokenType.COMMA)) {
            args.push(this.parseExpression());
          }
        }
        this.expect(TokenType.RPAREN, "Expected ')' after arguments");
        expr = { type: 'CallExpr', callee: expr, args, line: expr.line };
      } else if (this.peek().type === TokenType.DOT) {
        this.advance();
        const prop = this.expect(TokenType.IDENTIFIER, "Expected property name after '.'").value;
        expr = { type: 'MemberExpr', object: expr, property: prop, computed: false, line: expr.line };
      } else if (this.peek().type === TokenType.LBRACKET) {
        this.advance();
        const prop = this.parseExpression();
        this.expect(TokenType.RBRACKET, "Expected ']'");
        expr = { type: 'MemberExpr', object: expr, property: prop, computed: true, line: expr.line };
      } else {
        break;
      }
    }

    return expr;
  }

  parsePrimary() {
    const token = this.peek();

    // Lambda: |params| -> expr  or  |params| { block }
    if (token.type === TokenType.PIPE) {
      return this.parseLambda();
    }

    // Number
    if (token.type === TokenType.NUMBER) {
      this.advance();
      return { type: 'NumericLiteral', value: parseFloat(token.value), line: token.line };
    }

    // String
    if (token.type === TokenType.STRING) {
      this.advance();
      if (typeof token.value === 'object' && token.value.interpolated) {
        return { type: 'InterpolatedString', parts: token.value.parts, line: token.line };
      }
      return { type: 'StringLiteral', value: token.value, line: token.line };
    }

    // Boolean
    if (token.type === TokenType.TRUE) {
      this.advance();
      return { type: 'BooleanLiteral', value: true, line: token.line };
    }
    if (token.type === TokenType.FALSE) {
      this.advance();
      return { type: 'BooleanLiteral', value: false, line: token.line };
    }

    // Null
    if (token.type === TokenType.NULL) {
      this.advance();
      return { type: 'NullLiteral', line: token.line };
    }

    // Identifier
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return { type: 'Identifier', name: token.value, line: token.line };
    }

    // Array literal [...]
    if (token.type === TokenType.LBRACKET) {
      return this.parseArrayLiteral();
    }

    // Object literal { key: value }
    if (token.type === TokenType.LBRACE) {
      return this.parseObjectLiteral();
    }

    // Grouped expression (...)
    if (token.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN, "Expected ')'");
      return expr;
    }

    // Spread
    if (token.type === TokenType.SPREAD) {
      this.advance();
      const expr = this.parseExpression();
      return { type: 'SpreadExpr', argument: expr, line: token.line };
    }

    throw syntaxError(`Unexpected token '${token.value || token.type}'`, token.line, token.col, this.source);
  }

  // |x, y| -> x + y
  // |x| { return x * 2 }
  parseLambda() {
    const token = this.advance(); // consume opening |
    const params = [];
    if (this.peek().type !== TokenType.PIPE) {
      params.push(this.parseParam());
      while (this.match(TokenType.COMMA)) {
        params.push(this.parseParam());
      }
    }
    this.expect(TokenType.PIPE, "Expected '|' to close lambda parameters");

    let body;
    if (this.match(TokenType.ARROW)) {
      const expr = this.parseExpression();
      body = { type: 'ReturnStatement', value: expr, line: token.line };
    } else {
      body = this.parseBlock();
    }

    return { type: 'Lambda', params, body, line: token.line };
  }

  parseArrayLiteral() {
    const token = this.advance(); // consume [
    this.skipNewlines();
    const elements = [];
    while (this.peek().type !== TokenType.RBRACKET) {
      elements.push(this.parseExpression());
      this.match(TokenType.COMMA);
      this.skipNewlines();
    }
    this.expect(TokenType.RBRACKET, "Expected ']'");
    return { type: 'ArrayLiteral', elements, line: token.line };
  }

  parseObjectLiteral() {
    const token = this.advance(); // consume {
    this.skipNewlines();
    const properties = [];
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.expect(TokenType.IDENTIFIER, "Expected property name").value;
      if (this.match(TokenType.COLON)) {
        const value = this.parseExpression();
        properties.push({ key, value, shorthand: false });
      } else {
        // Shorthand: { x } means { x: x }
        properties.push({ key, value: { type: 'Identifier', name: key }, shorthand: true });
      }
      this.match(TokenType.COMMA);
      this.skipNewlines();
    }
    this.expect(TokenType.RBRACE, "Expected '}'");
    return { type: 'ObjectLiteral', properties, line: token.line };
  }
}

function parse(tokens, source) {
  const parser = new Parser(tokens, source);
  return parser.parse();
}

module.exports = { parse, Parser };
