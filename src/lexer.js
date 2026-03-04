'use strict';

const { syntaxError, stringError } = require('./errors');

const TokenType = {
  // Keywords
  FORGE: 'FORGE', LOCK: 'LOCK', RIP: 'RIP', FROM: 'FROM',
  RIFF: 'RIFF', SHRED: 'SHRED', AS: 'AS',
  WHISPER: 'WHISPER', SAY: 'SAY', YELL: 'YELL', SCREAM: 'SCREAM',
  BRACE: 'BRACE', RECOVER: 'RECOVER',
  MOSH: 'MOSH', GRAB: 'GRAB', DROP: 'DROP',
  IF: 'IF', ELSE: 'ELSE', WHILE: 'WHILE', RETURN: 'RETURN',
  TRUE: 'TRUE', FALSE: 'FALSE', NULL: 'NULL',
  AND: 'AND', OR: 'OR', NOT: 'NOT',
  AWAIT: 'AWAIT', ASYNC: 'ASYNC',

  // Literals
  NUMBER: 'NUMBER', STRING: 'STRING', IDENTIFIER: 'IDENTIFIER',

  // Operators
  PIPELINE: 'PIPELINE',     // ~>
  ARROW: 'ARROW',           // ->
  SPREAD: 'SPREAD',         // ...
  EQEQ: 'EQEQ',            // ==
  NEQ: 'NEQ',               // !=
  LTE: 'LTE',               // <=
  GTE: 'GTE',               // >=
  LT: 'LT',                 // <
  GT: 'GT',                  // >
  PLUS: 'PLUS',             // +
  MINUS: 'MINUS',           // -
  STAR: 'STAR',             // *
  SLASH: 'SLASH',           // /
  PERCENT: 'PERCENT',       // %
  ASSIGN: 'ASSIGN',         // =
  BANG: 'BANG',              // !
  AMPAMP: 'AMPAMP',         // &&
  PIPEPIPE: 'PIPEPIPE',     // ||
  PIPE: 'PIPE',             // |

  // Delimiters
  LPAREN: 'LPAREN', RPAREN: 'RPAREN',
  LBRACE: 'LBRACE', RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
  COMMA: 'COMMA', DOT: 'DOT', COLON: 'COLON', SEMICOLON: 'SEMICOLON',

  // Special
  EOF: 'EOF',
  NEWLINE: 'NEWLINE',
};

const KEYWORDS = {
  forge: TokenType.FORGE, lock: TokenType.LOCK, rip: TokenType.RIP,
  from: TokenType.FROM, riff: TokenType.RIFF, shred: TokenType.SHRED,
  as: TokenType.AS, whisper: TokenType.WHISPER, say: TokenType.SAY,
  yell: TokenType.YELL, scream: TokenType.SCREAM,
  brace: TokenType.BRACE, recover: TokenType.RECOVER,
  mosh: TokenType.MOSH, grab: TokenType.GRAB, drop: TokenType.DROP,
  if: TokenType.IF, else: TokenType.ELSE, while: TokenType.WHILE,
  return: TokenType.RETURN, true: TokenType.TRUE, false: TokenType.FALSE,
  null: TokenType.NULL, and: TokenType.AND, or: TokenType.OR,
  not: TokenType.NOT, await: TokenType.AWAIT, async: TokenType.ASYNC,
};

class Token {
  constructor(type, value, line, col) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.col = col;
  }
}

function tokenize(source) {
  const tokens = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  function peek(offset = 0) {
    return source[pos + offset];
  }

  function advance() {
    const ch = source[pos];
    pos++;
    if (ch === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  function addToken(type, value) {
    tokens.push(new Token(type, value, line, col));
  }

  while (pos < source.length) {
    const ch = source[pos];
    const startLine = line;
    const startCol = col;

    // Whitespace (not newlines)
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      advance();
      continue;
    }

    // Newlines
    if (ch === '\n') {
      advance();
      // Only add newline tokens if the previous token isn't already a newline
      if (tokens.length > 0 && tokens[tokens.length - 1].type !== TokenType.NEWLINE) {
        tokens.push(new Token(TokenType.NEWLINE, '\\n', startLine, startCol));
      }
      continue;
    }

    // Single-line comment
    if (ch === '/' && peek(1) === '/') {
      while (pos < source.length && source[pos] !== '\n') advance();
      continue;
    }

    // Multi-line comment
    if (ch === '/' && peek(1) === '*') {
      advance(); advance(); // skip /*
      while (pos < source.length) {
        if (source[pos] === '*' && peek(1) === '/') {
          advance(); advance();
          break;
        }
        advance();
      }
      continue;
    }

    // Numbers
    if (ch >= '0' && ch <= '9') {
      let num = '';
      const numCol = col;
      while (pos < source.length && ((source[pos] >= '0' && source[pos] <= '9') || source[pos] === '.')) {
        num += advance();
      }
      tokens.push(new Token(TokenType.NUMBER, num, startLine, numCol));
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const quote = ch;
      const strCol = col;
      advance(); // skip opening quote
      let str = '';
      let hasInterpolation = false;
      const parts = []; // for interpolated strings

      while (pos < source.length && source[pos] !== quote) {
        if (source[pos] === '\\') {
          advance();
          const esc = advance();
          switch (esc) {
            case 'n': str += '\n'; break;
            case 't': str += '\t'; break;
            case '\\': str += '\\'; break;
            case '"': str += '"'; break;
            case "'": str += "'"; break;
            case '$': str += '$'; break;
            default: str += esc;
          }
        } else if (source[pos] === '$' && peek(1) === '{') {
          hasInterpolation = true;
          if (str.length > 0) parts.push({ type: 'text', value: str });
          str = '';
          advance(); advance(); // skip ${
          let depth = 1;
          let expr = '';
          while (pos < source.length && depth > 0) {
            if (source[pos] === '{') depth++;
            if (source[pos] === '}') depth--;
            if (depth > 0) expr += advance();
            else advance(); // skip closing }
          }
          parts.push({ type: 'expr', value: expr });
        } else if (source[pos] === '\n') {
          throw stringError('Unterminated string — did you forget to close your quotes?', startLine, strCol, source);
        } else {
          str += advance();
        }
      }

      if (pos >= source.length) {
        throw stringError('Unterminated string — did you forget to close your quotes?', startLine, strCol, source);
      }
      advance(); // skip closing quote

      if (hasInterpolation) {
        if (str.length > 0) parts.push({ type: 'text', value: str });
        tokens.push(new Token(TokenType.STRING, { interpolated: true, parts }, startLine, strCol));
      } else {
        tokens.push(new Token(TokenType.STRING, str, startLine, strCol));
      }
      continue;
    }

    // Identifiers and keywords
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let ident = '';
      const idCol = col;
      while (pos < source.length && ((source[pos] >= 'a' && source[pos] <= 'z') ||
             (source[pos] >= 'A' && source[pos] <= 'Z') ||
             (source[pos] >= '0' && source[pos] <= '9') || source[pos] === '_')) {
        ident += advance();
      }
      const type = KEYWORDS[ident] || TokenType.IDENTIFIER;
      tokens.push(new Token(type, ident, startLine, idCol));
      continue;
    }

    // Operators and delimiters
    const opCol = col;
    switch (ch) {
      case '~':
        advance();
        if (pos < source.length && source[pos] === '>') {
          advance();
          tokens.push(new Token(TokenType.PIPELINE, '~>', startLine, opCol));
        } else {
          throw syntaxError(`Unexpected character '~' — did you mean '~>'?`, startLine, opCol, source);
        }
        break;
      case '-':
        advance();
        if (pos < source.length && source[pos] === '>') {
          advance();
          tokens.push(new Token(TokenType.ARROW, '->', startLine, opCol));
        } else {
          tokens.push(new Token(TokenType.MINUS, '-', startLine, opCol));
        }
        break;
      case '.':
        advance();
        if (pos < source.length && source[pos] === '.' && peek(1) === '.') {
          advance(); advance();
          tokens.push(new Token(TokenType.SPREAD, '...', startLine, opCol));
        } else {
          tokens.push(new Token(TokenType.DOT, '.', startLine, opCol));
        }
        break;
      case '=':
        advance();
        if (pos < source.length && source[pos] === '=') {
          advance();
          tokens.push(new Token(TokenType.EQEQ, '==', startLine, opCol));
        } else {
          tokens.push(new Token(TokenType.ASSIGN, '=', startLine, opCol));
        }
        break;
      case '!':
        advance();
        if (pos < source.length && source[pos] === '=') {
          advance();
          tokens.push(new Token(TokenType.NEQ, '!=', startLine, opCol));
        } else {
          tokens.push(new Token(TokenType.BANG, '!', startLine, opCol));
        }
        break;
      case '<':
        advance();
        if (pos < source.length && source[pos] === '=') {
          advance();
          tokens.push(new Token(TokenType.LTE, '<=', startLine, opCol));
        } else {
          tokens.push(new Token(TokenType.LT, '<', startLine, opCol));
        }
        break;
      case '>':
        advance();
        if (pos < source.length && source[pos] === '=') {
          advance();
          tokens.push(new Token(TokenType.GTE, '>=', startLine, opCol));
        } else {
          tokens.push(new Token(TokenType.GT, '>', startLine, opCol));
        }
        break;
      case '&':
        advance();
        if (pos < source.length && source[pos] === '&') {
          advance();
          tokens.push(new Token(TokenType.AMPAMP, '&&', startLine, opCol));
        } else {
          throw syntaxError(`Unexpected character '&' — did you mean '&&'?`, startLine, opCol, source);
        }
        break;
      case '|':
        advance();
        if (pos < source.length && source[pos] === '|') {
          advance();
          tokens.push(new Token(TokenType.PIPEPIPE, '||', startLine, opCol));
        } else {
          tokens.push(new Token(TokenType.PIPE, '|', startLine, opCol));
        }
        break;
      case '+': advance(); tokens.push(new Token(TokenType.PLUS, '+', startLine, opCol)); break;
      case '*': advance(); tokens.push(new Token(TokenType.STAR, '*', startLine, opCol)); break;
      case '/': advance(); tokens.push(new Token(TokenType.SLASH, '/', startLine, opCol)); break;
      case '%': advance(); tokens.push(new Token(TokenType.PERCENT, '%', startLine, opCol)); break;
      case '(': advance(); tokens.push(new Token(TokenType.LPAREN, '(', startLine, opCol)); break;
      case ')': advance(); tokens.push(new Token(TokenType.RPAREN, ')', startLine, opCol)); break;
      case '{': advance(); tokens.push(new Token(TokenType.LBRACE, '{', startLine, opCol)); break;
      case '}': advance(); tokens.push(new Token(TokenType.RBRACE, '}', startLine, opCol)); break;
      case '[': advance(); tokens.push(new Token(TokenType.LBRACKET, '[', startLine, opCol)); break;
      case ']': advance(); tokens.push(new Token(TokenType.RBRACKET, ']', startLine, opCol)); break;
      case ',': advance(); tokens.push(new Token(TokenType.COMMA, ',', startLine, opCol)); break;
      case ':': advance(); tokens.push(new Token(TokenType.COLON, ':', startLine, opCol)); break;
      case ';': advance(); tokens.push(new Token(TokenType.SEMICOLON, ';', startLine, opCol)); break;
      default:
        throw syntaxError(`Unexpected character '${ch}'`, startLine, opCol, source);
    }
  }

  tokens.push(new Token(TokenType.EOF, null, line, col));
  return tokens;
}

module.exports = { tokenize, TokenType, Token };
