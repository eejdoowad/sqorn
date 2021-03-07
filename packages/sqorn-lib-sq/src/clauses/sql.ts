// import {
//   isTaggedTemplate,
//   buildTaggedTemplate,
//   mapJoinWrap,
//   BuildArg
// } from '@sqorn/lib-util'
// import { BuildClause } from '../common'

// export const buildSql: BuildClause = ctx => {
//   const calls = ctx.sql
//   let txt = ''
//   for (let i = 0; i < calls.length; ++i) {
//     if (i !== 0) txt += ctx.separator
//     txt += sql(ctx, calls[i])
//   }
//   return txt
// }

// const buildArgs = mapJoinWrap((ctx, arg) => ctx.build(arg))

// const sql: BuildArg = (ctx, args) => {
//   if (isTaggedTemplate(args)) return buildTaggedTemplate(ctx, args)
//   if (args.length === 1) return ctx.build(args[0])
//   return buildArgs(ctx, args)
// }
