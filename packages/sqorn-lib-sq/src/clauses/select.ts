import { buildExpressions, BuildClause } from '../common'

export const buildSelect: BuildClause = ctx =>
  `select ${buildDistinct(ctx)}${buildExpressions(ctx, ctx.ret) || '*'}`

const buildDistinct: BuildClause = ctx =>
  ctx.distinct
    ? ctx.distinct.length
      ? // TODO: expressions shouldn't be aliasable here
        `distinct on (${buildExpressions(ctx, ctx.distinct)})`
      : 'distinct'
    : ''
