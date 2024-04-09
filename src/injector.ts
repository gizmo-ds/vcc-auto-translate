import { InjectFunction } from '@/types/injector'
import { AssignmentExpression, MemberExpression } from '@babel/types'
import { walkAST, babelParse } from 'ast-walker-scope'
import { MagicString } from 'magic-string-ast'

const propertys = ['jsx', 'createElement']

export async function injector(code: string, funcs: InjectFunction[]): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const filters: string[] = [...new Set(funcs.map((f) => f.type))].filter((n) =>
      propertys.includes(n)
    )
    if (filters.length === 0) return resolve(code)
    const nodes: Record<string, AssignmentExpression | undefined> = filters.reduce((acc, key) => {
      acc[key] = undefined
      return acc
    }, {})

    const ms = new MagicString(code)
    const ast = babelParse(code)

    let skip = false
    walkAST(ast, {
      enter(node) {
        if (skip) return this.skip()

        if (filters.length > 0) {
          if (
            node.type === 'ExpressionStatement' &&
            node.expression.type === 'AssignmentExpression' &&
            node.expression.operator === '=' &&
            node.expression.left.type === 'MemberExpression' &&
            node.expression.left.property.type === 'Identifier' &&
            node.expression.right.type === 'Identifier'
          ) {
            const name = node.expression.left.property.name
            if (!filters.includes(name)) return this.skip()
            nodes[name] = node.expression
            if (Object.keys(nodes).every((n) => nodes[n] !== undefined)) skip = true
            if (propertys.every((n) => nodes[n] !== undefined)) skip = true
            return this.skip()
          }
        }
      },
    })

    for (const name of filters) {
      funcs
        .filter((f) => f.type === name)
        .forEach((f) => {
          const node = nodes[name]!
          const obj = (node.left as MemberExpression).object
          //@ts-ignore
          const n = `${obj.name}.${node.left.property.name}`
          ms.appendRight(node.right.end!, `;${n}=__vcc_function_proxy__(${n},${f.name})`)
        })
    }

    resolve(ms.toString())
  })
}

export function function_proxy(ofn: Function, fn1: Function, fn2: Function) {
  return new Proxy(ofn, {
    apply: function (target, thisArg, argumentsList) {
      fn1 && fn1.apply(thisArg, argumentsList)
      const result = target.apply(thisArg, argumentsList)
      if (fn2) return fn2(result)
      return result
    },
  })
}
