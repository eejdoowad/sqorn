import { buildTaggedTemplate, mapJoinWrap } from '@sqorn/lib-util'
type Context = any
type Value = any[]
type Arg = any // { exp: string } | { tag: any } | { arg: any }

export const build = (ctx: Context, arg: Arg): string => {
  // compiled expression string
  if (arg.exp) return arg.exp
  // tagged template argument
  if (arg.tag) return buildTaggedTemplate(ctx, arg.tag)
  // expression, subquery or fragment argument
  return ctx.build(arg.arg)
}

type Expression = {
  minArgs: number,
  maxArgs: number,
  build: (ctx: Context, args: any[]) => string
}
type ExpressionCreator = (...ops: string[]) => Expression

export const unaryPre: ExpressionCreator = op => ({
  minArgs: 1,
  maxArgs: 1,
  build: (ctx, args) => `(${op} ${build(ctx, args[0])})`
})

export const unaryPost: ExpressionCreator = op => ({
  minArgs: 1,
  maxArgs: 1,
  build: (ctx, args) => `(${build(ctx, args[0])} ${op})`
})

export const unaryFunction: ExpressionCreator = op => ({
  minArgs: 1,
  maxArgs: 1,
  build: (ctx, args) => `${op}(${build(ctx, args[0])})`
})

export const binary: ExpressionCreator = op => ({
  minArgs: 2,
  maxArgs: 2,
  build: (ctx, args) => `(${build(ctx, args[0])} ${op} ${build(ctx, args[1])})`
})

export const ternary: ExpressionCreator = (op1, op2) => ({
  minArgs: 3,
  maxArgs: 3,
  build: (ctx, args) =>
    `(${build(ctx, args[0])} ${op1} ${build(ctx, args[1])} ${op2} ${build(
      ctx,
      args[2]
    )})`
})

export const nary: ExpressionCreator = op => ({
  minArgs: 1,
  maxArgs: Number.MAX_SAFE_INTEGER,
  build: (ctx, args) => {
    if (args.length === 1) return build(ctx, args[0])
    let txt = '('
    for (let i = 0; i < args.length; ++i) {
      if (i !== 0) txt += ` ${op} `
      txt += build(ctx, args[i])
    }
    return txt + ')'
  }
})

export const naryFunction: ExpressionCreator = fn => ({
  minArgs: 1,
  maxArgs: Number.MAX_SAFE_INTEGER,
  build: (ctx, args) => {
    let txt = `${fn}(`
    for (let i = 0; i < args.length; ++i) {
      if (i !== 0) txt += `, `
      txt += build(ctx, args[i])
    }
    return txt + ')'
  }
})

export const oneValue: Expression = {
  minArgs: 1,
  maxArgs: 1,
  build: (ctx, args) => build(ctx, args[0])
}

export const compositeValue: Expression = {
  minArgs: 1,
  maxArgs: Number.MAX_SAFE_INTEGER,
  build: (ctx, args) => {
    if (args.length === 1) return build(ctx, args[0])
    let txt = ''
    for (let i = 0; i < args.length; ++i) {
      if (i !== 0) txt += ', '
      txt += build(ctx, args[i])
    }
    return args.length > 1 ? `(${txt})` : txt
  }
}

export const buildValuesList = (ctx: Context, values: Value[]) => {
  if (values.length === 0) throw Error('Error: .in operation values list empty')
  let txt = '('
  for (let i = 0; i < values.length; ++i) {
    if (i !== 0) txt += ', '
    txt += ctx.build(values[i])
  }
  return txt + ')'
}

export const membership: ExpressionCreator = op => ({
  minArgs: 2,
  maxArgs: 2,
  build: (ctx, [arg1, arg2]) =>
    `(${build(ctx, arg1)} ${op} ${
      Array.isArray(arg2.arg)
        ? buildValuesList(ctx, arg2.arg)
        : build(ctx, arg2)
    })`
})

export const quantifiedComparison: ExpressionCreator = op => ({
  minArgs: 2,
  maxArgs: 2,
  build: (ctx, args) => `(${build(ctx, args[0])} ${op}(${build(ctx, args[1])}))`
})
