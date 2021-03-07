import { BaseContext } from '@sqorn/lib-types'
import {
  isTaggedTemplate,
  buildTaggedTemplate,
  BuildArgs
} from '@sqorn/lib-util'
import { BuildClause, buildFromItems, buildValuesArray } from '../common'

export const buildInsert: BuildClause = ctx => {
  const table = buildFromItems(ctx, ctx.frm)
  const values = buildCall(ctx, ctx.insert)
  return `insert into ${table}${values}`
}

const buildCall: BuildArgs = (ctx, args) => {
  if (isTaggedTemplate(args)) return ' ' + buildTaggedTemplate(ctx, args)
  if (args.length === 1 && args[0] === undefined) return ' default values'
  if (Array.isArray(args[0])) return valuesArray(ctx, args[0])
  if (typeof args[0] === 'function') return ' ' + ctx.build(args[0])
  return valuesArray(ctx, args)
}

type ValuesArray = (ctx: BaseContext, array: any[]) => string
const valuesArray: ValuesArray = (ctx, array) => {
  const { values, columns } = buildValuesArray(ctx, array)
  return `(${columns}) ${values}`
}
