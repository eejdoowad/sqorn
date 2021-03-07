import { buildFromItems, BuildClause } from '../common'

export const buildUpdate: BuildClause = ctx => {
  const txt = buildFromItems(ctx, ctx.frm)
  return txt && `update ${txt}`
}
