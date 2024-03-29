import parser from '@babel/parser'
import traverseG from '@babel/traverse'
import generateG from '@babel/generator'
import types from '@babel/types'
import { sourceCode } from './code.js'

const traverse = traverseG.default
const generate = generateG.default

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx']
})

const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);


traverse(ast, {
  CallExpression(path, state) {
    let condition = false;
    // v1: 最简单的判断方法，但是比较冗长
    // condition = types.isMemberExpression(path.node.callee)
    // && path.node.callee.object.name === 'console'
    // && ['log', 'info', 'error', 'debug'].includes(path.node.callee.property.name)
    // v2: 通过打印对应的代码，直接比对代码，更简洁
    let calleeCode = generate(path.node.callee).code // 打印的代码类似 'console.log'
    condition = targetCalleeName.includes(calleeCode)
    if (condition) {
      const { line, column } = path.node.loc.start;
  
      // 从astexplorer上来看，新增的arguments也需要是一个ast节点，所以这里需要用types.stringLiteral来创建string节点。而不是简单的把string添加进去。
      path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`))
    }
  }
})

const { code, map } = generate(ast)
console.log(code)
