import { BuildClause, buildLimitOffset } from '../common'

export const buildOffset: BuildClause = ctx =>
  ctx.offset && `offset ${buildLimitOffset(ctx, ctx.offset)}`
