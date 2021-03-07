import { BuildClause, buildFromItems } from '../common'

export const buildDelete: BuildClause = ctx => {
  const txt = buildFromItems(ctx, ctx.frm)
  return txt && `delete from ${txt}`
}
