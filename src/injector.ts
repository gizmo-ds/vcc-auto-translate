import { FunctionDeclaration, Identifier } from '@babel/types'
import { walkAST, babelParse } from 'ast-walker-scope'
import { MagicString } from 'magic-string-ast'

export async function injector_jsx(code: string, functions: string[]): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const ms = new MagicString(code)
    const ast = babelParse(code)

    let jsx_func_name = ''
    let skip = false
    const funcs: FunctionDeclaration[] = []
    walkAST(ast, {
      enter(node) {
        if (skip) return this.skip()
        if (node.type === 'FunctionDeclaration' && node.id && node.params.length >= 2) {
          funcs.push(node)
          return this.skip()
        }
        if (
          node.type === 'AssignmentExpression' &&
          node.operator === '=' &&
          node.left.type === 'MemberExpression' &&
          node.left.property.type === 'Identifier' &&
          node.right.type === 'Identifier' &&
          node.left.property.name === 'jsxs'
        ) {
          jsx_func_name = node.right.name
          skip = true
          return this.skip()
        }
      },
    })

    if (!jsx_func_name) return reject(new Error('Cannot find jsx function'))
    const jsx_func = funcs.find((f) => f.id!.name === jsx_func_name)
    if (!jsx_func) return reject(new Error('Cannot find jsx function'))

    skip = false
    const params = jsx_func.params as Identifier[]
    walkAST(jsx_func, {
      enter(node) {
        if (skip) return this.skip()
        if (node.type === 'VariableDeclaration') {
          for (const fname of functions)
            ms.appendRight(
              node.start!,
              `${params[1].name}=${fname}(${params[0].name},${params[1].name});`
            )
          skip = true
          return this.skip()
        }
      },
    })

    resolve(ms.toString())
  })
}
