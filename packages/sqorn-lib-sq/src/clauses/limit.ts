import { BuildClause, buildLimitOffset } from '../common'

export const buildLimit: BuildClause = ctx =>
  ctx.limit && `limit ${buildLimitOffset(ctx, ctx.limit)}`
