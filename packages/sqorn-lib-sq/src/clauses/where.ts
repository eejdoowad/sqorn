import { buildConditions, BuildClause } from '../common'

export const buildWhere: BuildClause = ctx => {
  if (ctx.whr.length === 0) return ''
  const txt = buildConditions(ctx, ctx.whr)
  return txt && 'where ' + txt
}
