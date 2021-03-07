import { BuildClause, buildFromItems } from '../common'

export const buildFrom: BuildClause = ctx => {
  const txt = buildFromItems(ctx, ctx.frm)
  return txt && `from ${txt}`
}
