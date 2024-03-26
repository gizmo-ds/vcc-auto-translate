import { FunctionDeclaration, Identifier } from '@babel/types'
import { walkAST, babelParse } from 'ast-walker-scope'
import { MagicString } from 'magic-string-ast'

export interface inject_function {
  name: string
  type: 'jsx' | 'createElement'
}

export async function injector(code: string, functions: inject_function[]): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const ms = new MagicString(code)
    const ast = babelParse(code)

    let jsx_func_name: string | undefined
    let createElement_func_name: string | undefined
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
          node.right.type === 'Identifier'
        ) {
          switch (node.left.property.name) {
            case 'jsxs':
              jsx_func_name = node.right.name
              break
            case 'createElement':
              createElement_func_name = node.right.name
              break
          }
          if (jsx_func_name && createElement_func_name) skip = true
          return this.skip()
        }
      },
    })

    if (functions.findIndex((f) => f.type == 'jsx') > -1) {
      skip = false
      if (!jsx_func_name) return reject(new Error('Cannot find jsx function'))
      const func = funcs.find((f) => f.id!.name === jsx_func_name)
      if (!func) return reject(new Error('Cannot find jsx function'))
      const params = func.params as Identifier[]
      walkAST(func, {
        enter(node) {
          if (skip) return this.skip()
          if (node.type === 'VariableDeclaration') {
            for (const fn of functions)
              fn.type == 'jsx' &&
                ms.appendRight(node.start!, `${fn.name}(${params.map((p) => p.name).join(',')});`)
            skip = true
            return this.skip()
          }
        },
      })
    }
    if (functions.findIndex((f) => f.type == 'createElement') > -1) {
      skip = false
      if (!createElement_func_name) return reject(new Error('Cannot find createElement function'))
      const func = funcs.find((f) => f.id!.name === createElement_func_name)
      if (!func) return reject(new Error('Cannot find createElement function'))
      const params = func.params as Identifier[]
      walkAST(func, {
        enter(node) {
          if (skip) return this.skip()
          if (node.type === 'VariableDeclaration') {
            for (const fn of functions)
              fn.type == 'createElement' &&
                ms.appendRight(node.start!, `${fn.name}(${params.map((p) => p.name).join(',')});`)
            skip = true
            return this.skip()
          }
        },
      })
    }

    resolve(ms.toString())
  })
}
