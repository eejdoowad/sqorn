import { buildExpressions, BuildClause } from '../common'

export const buildReturning: BuildClause = ctx => {
  if (!ctx.ret) return ''
  const txt = buildExpressions(ctx, ctx.ret)
  return txt && `returning ${txt}`
}
