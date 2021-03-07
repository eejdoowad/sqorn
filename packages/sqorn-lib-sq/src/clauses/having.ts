import { buildConditions, BuildClause } from '../common'

export const buildHaving: BuildClause = ctx => {
  if (ctx.hav.length === 0) return ''
  const txt = buildConditions(ctx, ctx.hav)
  return txt && 'having ' + txt
}
