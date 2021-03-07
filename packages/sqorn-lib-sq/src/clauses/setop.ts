import { BuildClause } from '../common'

export const buildSetOperator: BuildClause = ctx => {
  if (ctx.setop.length === 0) return ''
  let txt = ''
  let first = true
  const { setop } = ctx
  for (let i = 0; i < setop.length; ++i) {
    const { type, args } = ctx.setop[i]
    for (let j = 0; j < args.length; ++j) {
      if (!first) {
        txt += ' '
      } else {
        first = false
      }
      txt += `${type} ${ctx.build(args[j])}`
    }
  }
  return txt
}
