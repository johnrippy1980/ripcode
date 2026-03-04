'use strict';

const path = require('path');

class Transpiler {
  constructor() {
    this.indent = 0;
    this.needsRuntime = false;
    this.runtimeFeatures = new Set();
  }

  transpile(ast) {
    this.indent = 0;
    this.needsRuntime = false;
    this.runtimeFeatures.clear();

    const body = ast.body.map(node => this.emitNode(node)).filter(Boolean).join('\n');

    let header = '';
    if (this.needsRuntime) {
      const features = Array.from(this.runtimeFeatures);
      header = `const { ${features.join(', ')} } = require('${path.join(__dirname, 'runtime').replace(/\\/g, '/')}');\n\n`;
    }

    return header + body + '\n';
  }

  pad() {
    return '  '.repeat(this.indent);
  }

  useRuntime(feature) {
    this.needsRuntime = true;
    this.runtimeFeatures.add(feature);
  }

  emitNode(node) {
    if (!node) return '';

    switch (node.type) {
      case 'Program': return node.body.map(n => this.emitNode(n)).join('\n');
      case 'ForgeDecl': return this.emitForge(node);
      case 'LockDecl': return this.emitLock(node);
      case 'RipExpr': return this.emitRip(node);
      case 'RiffDecl': return this.emitRiff(node);
      case 'ShredLoop': return this.emitShred(node);
      case 'NoiseStmt': return this.emitNoise(node);
      case 'BraceRecover': return this.emitBraceRecover(node);
      case 'MoshBlock': return this.emitMosh(node);
      case 'IfStmt': return this.emitIf(node);
      case 'WhileStmt': return this.emitWhile(node);
      case 'GrabStmt': return this.emitGrab(node);
      case 'DropStmt': return this.emitDrop(node);
      case 'ReturnStatement': return this.emitReturn(node);
      case 'ExpressionStatement': return `${this.pad()}${this.emitExpr(node.expression)};`;
      case 'Block': return this.emitBlock(node);
      default: return `${this.pad()}${this.emitExpr(node)};`;
    }
  }

  emitForge(node) {
    return `${this.pad()}let ${node.name} = ${this.emitExpr(node.value)};`;
  }

  emitLock(node) {
    return `${this.pad()}const ${node.name} = ${this.emitExpr(node.value)};`;
  }

  emitRip(node) {
    const names = node.names.join(', ');
    const src = this.emitExpr(node.source);
    // Detect if source is likely an array (ArrayLiteral) or object
    if (node.source.type === 'ArrayLiteral') {
      return `${this.pad()}const [${names}] = ${src};`;
    }
    return `${this.pad()}const { ${names} } = ${src};`;
  }

  emitRiff(node) {
    const params = node.params.map(p => this.emitParam(p)).join(', ');
    const asyncPrefix = node.async ? 'async ' : '';
    if (node.body.type === 'ReturnStatement') {
      return `${this.pad()}${asyncPrefix}function ${node.name}(${params}) { return ${this.emitExpr(node.body.value)}; }`;
    }
    const body = this.emitBlockInner(node.body);
    return `${this.pad()}${asyncPrefix}function ${node.name}(${params}) {\n${body}\n${this.pad()}}`;
  }

  emitParam(param) {
    if (param.type === 'RestParam') return `...${param.name}`;
    if (param.default) return `${param.name} = ${this.emitExpr(param.default)}`;
    return param.name;
  }

  emitShred(node) {
    const iter = this.emitExpr(node.iterable);
    const body = this.emitBlockInner(node.body);
    return `${this.pad()}for (const ${node.variable} of ${iter}) {\n${body}\n${this.pad()}}`;
  }

  emitNoise(node) {
    const args = node.args.map(a => this.emitExpr(a)).join(', ');
    const methodMap = {
      whisper: 'whisper',
      say: 'say',
      yell: 'yell',
      scream: 'scream',
    };
    const fn = methodMap[node.level];
    this.useRuntime(fn);
    return `${this.pad()}${fn}(${args});`;
  }

  emitBraceRecover(node) {
    const tryBody = this.emitBlockInner(node.tryBlock);
    const catchBody = this.emitBlockInner(node.catchBlock);
    const errorVar = node.errorVar || '__err';
    return `${this.pad()}try {\n${tryBody}\n${this.pad()}} catch (${errorVar}) {\n${catchBody}\n${this.pad()}}`;
  }

  emitMosh(node) {
    this.useRuntime('__ripMosh');
    const tasks = node.tasks.map(t => this.emitExpr(t)).join(', ');
    if (node.resultVar) {
      return `${this.pad()}const ${node.resultVar} = await __ripMosh([${tasks}]);`;
    }
    return `${this.pad()}await __ripMosh([${tasks}]);`;
  }

  emitIf(node) {
    const cond = this.emitExpr(node.condition);
    const body = this.emitBlockInner(node.consequent);
    let result = `${this.pad()}if (${cond}) {\n${body}\n${this.pad()}}`;

    if (node.alternate) {
      if (node.alternate.type === 'IfStmt') {
        result += ` else ${this.emitIf(node.alternate).trimStart()}`;
      } else {
        const altBody = this.emitBlockInner(node.alternate);
        result += ` else {\n${altBody}\n${this.pad()}}`;
      }
    }
    return result;
  }

  emitWhile(node) {
    const cond = this.emitExpr(node.condition);
    const body = this.emitBlockInner(node.body);
    return `${this.pad()}while (${cond}) {\n${body}\n${this.pad()}}`;
  }

  emitGrab(node) {
    if (node.destructured) {
      return `${this.pad()}const { ${node.imports.join(', ')} } = require('${node.module}');`;
    }
    if (node.imports.length === 1) {
      return `${this.pad()}const ${node.imports[0]} = require('${node.module}');`;
    }
    return `${this.pad()}const { ${node.imports.join(', ')} } = require('${node.module}');`;
  }

  emitDrop(node) {
    return node.exports.map(name => `${this.pad()}module.exports.${name} = ${name};`).join('\n');
  }

  emitReturn(node) {
    if (!node.value) return `${this.pad()}return;`;
    return `${this.pad()}return ${this.emitExpr(node.value)};`;
  }

  emitBlock(node) {
    const inner = this.emitBlockInner(node);
    return `${this.pad()}{\n${inner}\n${this.pad()}}`;
  }

  emitBlockInner(block) {
    this.indent++;
    const lines = block.body.map(n => this.emitNode(n)).filter(Boolean).join('\n');
    this.indent--;
    return lines;
  }

  // Expression emitters
  emitExpr(node) {
    if (!node) return 'undefined';

    switch (node.type) {
      case 'NumericLiteral': return String(node.value);
      case 'StringLiteral': return JSON.stringify(node.value);
      case 'InterpolatedString': return this.emitInterpolated(node);
      case 'BooleanLiteral': return String(node.value);
      case 'NullLiteral': return 'null';
      case 'Identifier': return node.name;
      case 'BinaryExpr': return `(${this.emitExpr(node.left)} ${node.op} ${this.emitExpr(node.right)})`;
      case 'UnaryExpr': return `${node.op}${this.emitExpr(node.operand)}`;
      case 'CallExpr': return this.emitCall(node);
      case 'MemberExpr': return this.emitMember(node);
      case 'PipelineExpr': return this.emitPipeline(node);
      case 'Lambda': return this.emitLambda(node);
      case 'ArrayLiteral': return this.emitArray(node);
      case 'ObjectLiteral': return this.emitObject(node);
      case 'SpreadExpr': return `...${this.emitExpr(node.argument)}`;
      case 'AwaitExpr': return `await ${this.emitExpr(node.operand)}`;
      case 'AssignExpr': return `${this.emitExpr(node.target)} = ${this.emitExpr(node.value)}`;
      default: return `/* unknown: ${node.type} */`;
    }
  }

  emitInterpolated(node) {
    const parts = node.parts.map(p => {
      if (p.type === 'text') return p.value.replace(/`/g, '\\`').replace(/\\/g, '\\\\');
      // Expression parts — re-tokenize and parse the expression
      return '${' + p.value + '}';
    });
    return '`' + parts.join('') + '`';
  }

  emitCall(node) {
    const callee = this.emitExpr(node.callee);
    const args = node.args.map(a => this.emitExpr(a)).join(', ');
    return `${callee}(${args})`;
  }

  emitMember(node) {
    const obj = this.emitExpr(node.object);
    if (node.computed) {
      return `${obj}[${this.emitExpr(node.property)}]`;
    }
    return `${obj}.${node.property}`;
  }

  emitPipeline(node) {
    this.useRuntime('__ripPipe');
    // Collect entire pipeline chain
    const stages = [];
    let current = node;
    while (current.type === 'PipelineExpr') {
      stages.unshift(current.right);
      current = current.left;
    }
    const initial = this.emitExpr(current);
    const fns = stages.map(s => this.emitExpr(s)).join(', ');
    return `__ripPipe(${initial}, ${fns})`;
  }

  emitLambda(node) {
    const params = node.params.map(p => this.emitParam(p)).join(', ');
    if (node.body.type === 'ReturnStatement') {
      return `(${params}) => ${this.emitExpr(node.body.value)}`;
    }
    const body = this.emitBlockInner(node.body);
    return `(${params}) => {\n${body}\n${this.pad()}}`;
  }

  emitArray(node) {
    const elements = node.elements.map(e => this.emitExpr(e)).join(', ');
    return `[${elements}]`;
  }

  emitObject(node) {
    if (node.properties.length === 0) return '{}';
    const props = node.properties.map(p => {
      if (p.shorthand) return p.key;
      return `${p.key}: ${this.emitExpr(p.value)}`;
    });
    return `{ ${props.join(', ')} }`;
  }
}

function transpile(ast) {
  const t = new Transpiler();
  return t.transpile(ast);
}

module.exports = { transpile, Transpiler };
