import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import {
  expressionStatement,
  assignmentExpression,
  callExpression,
  identifier,
  Identifier,
} from '@babel/types'
import { CodeGenerator } from '@babel/generator'

export async function injector(code: string, fname: string): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const ast = parse(code, { sourceType: 'module' })

    let inject = false

    traverse(ast, {
      AssignmentExpression(path) {
        const node = path.node
        if (
          node.operator === '=' &&
          node.left.type === 'MemberExpression' &&
          node.left.property.type === 'Identifier' &&
          node.right.type === 'Identifier' &&
          node.left.property.name === 'jsxs'
        ) {
          if (inject) return
          const name = node.right.name
          traverse(
            path.parentPath.parent,
            {
              FunctionDeclaration(path) {
                if (inject) return
                const node = path.node
                if (node.id?.name === name) {
                  traverse(
                    node,
                    {
                      VariableDeclaration(path) {
                        if (inject) return
                        //@ts-ignore
                        const params: Identifier[] = node.params

                        const n = expressionStatement(
                          assignmentExpression(
                            '=',
                            params[1],
                            callExpression(identifier(fname), [params[0], params[1]])
                          )
                        )
                        path.insertBefore(n)
                        inject = true
                      },
                    },
                    path.scope
                  )
                }
              },
            },
            path.parentPath.parentPath?.scope
          )
        }
      },
    })

    resolve(new CodeGenerator(ast).generate().code)
  })
}
