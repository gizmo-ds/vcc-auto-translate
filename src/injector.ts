import { FunctionDeclaration, Identifier } from '@babel/types'
import { walkAST, babelParse } from 'ast-walker-scope'
import { MagicString } from 'magic-string-ast'

export async function injector(code: string, fname: string): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const ms = new MagicString(code)
    const ast = babelParse(code)

    let inject = false
    let jsx_func_name = ''
    const funcs: Record<string, FunctionDeclaration> = {}

    walkAST(ast, {
      enter(node) {
        if (inject) return this.skip()
        if (node.type === 'FunctionDeclaration' && node.id) {
          funcs[node.id.name] = node
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
          inject = true
        }
      },
    })
    const jsx_func = funcs[jsx_func_name]
    if (jsx_func_name !== '' && jsx_func !== undefined) {
      let inject = false

      //@ts-ignore
      const params: Identifier[] = jsx_func.params

      walkAST(jsx_func, {
        enter(node) {
          if (inject) return this.skip()
          if (node.type === 'VariableDeclaration') {
            ms.appendRight(
              node.start!,
              `${params[1].name}=${fname}(${params[0].name},${params[1].name});`
            )
            inject = true
            return this.skip()
          }
        },
      })
    }

    resolve(ms.toString())
  })
}
