import { BaseContext } from '@sqorn/lib-types'
import {
  isObject,
  buildCall,
  mapJoin,
  objectMapJoin,
  BuildProperty
} from '@sqorn/lib-util'
import { buildConditions } from './conditions'
import { buildValuesArray } from './values_array'

type Item = any

type BuildFromItems = (
  ctx: BaseContext,
  items: Item[],
  start?: number,
  end?: number
) => string
export const buildFromItems: BuildFromItems = (
  ctx,
  items,
  start = 0,
  end = items.length
) => {
  if (end > items.length) end = items.length
  let txt = ''
  for (let i = start; i < end; ++i) {
    const item = items[i]
    if (i !== start) txt += item.join
    txt += buildFromItem(ctx, item.args)
    if (item.on) txt += ` on ${buildConditions(ctx, item.on)}`
    else if (item.using) txt += ` using (${using(ctx, item.using)})`
  }
  return txt
}

type UsingArg = (ctx: BaseContext, arg: any) => string
const usingArg: UsingArg = (ctx, arg) => {
  if (typeof arg === 'string') return arg
  if (typeof arg === 'function') return ctx.build(arg)
  throw Error('Error: Invalid .using arg')
}
const using = mapJoin(buildCall(mapJoin(usingArg)))

type FromArg = (ctx: BaseContext, arg: any) => string
const fromArg: FromArg = (ctx, arg) => {
  if (typeof arg === 'string') return arg
  if (typeof arg === 'function') return ctx.build(arg)
  if (isObject(arg)) return buildObject(ctx, arg)
  throw Error('Error: Invalid .from argument')
}

const buildProperty: BuildProperty = (ctx, key, value) => {
  if (typeof value === 'string') return `${value} ${ctx.mapKey(key)}`
  if (typeof value === 'function')
    return `${ctx.build(value)} ${ctx.mapKey(key)}`
  if (Array.isArray(value)) {
    const { columns, values } = buildValuesArray(ctx, value)
    return `(${values}) ${ctx.mapKey(key)}(${columns})`
  }
  throw Error('Error: Invalid .from argument')
}

const buildObject = objectMapJoin(buildProperty)
const buildFromItem = buildCall(mapJoin(fromArg))
