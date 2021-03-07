import {
  isObject,
  buildCall,
  mapJoin,
  BuildArg,
  BuildObject
} from '@sqorn/lib-util'
import { BuildClause } from '../common'

export const buildOrderBy: BuildClause = ctx => {
  if (ctx.ord.length === 0) return ''
  const txt = calls(ctx, ctx.ord)
  return txt && `order by ${txt}`
}

const buildArg: BuildArg = (ctx, arg) => {
  if (typeof arg === 'string') return arg
  if (typeof arg === 'function') return ctx.build(arg)
  if (isObject(arg)) return buildObject(ctx, arg)
  throw Error('Invalid order by argument:')
}

const buildObject: BuildObject = (ctx, obj) => {
  let txt = ''
  const { by, sort, using, nulls } = obj
  // by
  if (typeof by === 'string') txt += by
  else if (typeof by === 'function') txt += ctx.build(by)
  else throw Error('Invalid order by property "by"')
  // sort
  if (sort) {
    if (sort === 'desc') txt += ' desc'
    else if (sort === 'asc') txt += ' asc'
    else if (typeof sort === 'string') txt += ` using ${sort}`
    else throw Error('Invalid order by property "sort"')
  } else if (using) {
    if (typeof using === 'string') txt += ` using ${using}`
    else throw Error('Invalid order by property "using"')
  }
  // nulls
  if (nulls === undefined) {
  } else if (nulls === 'last') txt += ' nulls last'
  else if (nulls === 'first') txt += ' nulls first'
  else throw Error('Invalid order by property "nulls"')
  // return
  return txt
}

const calls = mapJoin(buildCall(mapJoin(buildArg)))
