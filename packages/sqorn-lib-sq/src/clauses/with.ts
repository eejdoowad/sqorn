import {
  isObject,
  buildCall,
  mapJoin,
  objectMapJoin,
  BuildArg,
  BuildProperty
} from '@sqorn/lib-util'
import { BuildClause, buildValuesArray } from '../common'

export const buildWith: BuildClause = ctx => {
  if (ctx.with.length === 0) return ''
  const txt = calls(ctx, ctx.with)
  return txt && `with ${ctx.recursive ? 'recursive ' : ''}${txt}`
}

const buildArg: BuildArg = (ctx, arg) => {
  if (isObject(arg)) return buildObject(ctx, arg)
  throw Error('Invalid .with argument:')
}

const buildProperty: BuildProperty = (ctx, key, value) => {
  if (typeof value === 'function') {
    return `${ctx.mapKey(key)} ${ctx.build(value)}`
  }
  if (Array.isArray(value)) {
    const { columns, values } = buildValuesArray(ctx, value)
    return `${ctx.mapKey(key)}(${columns}) (${values})`
  }
  throw Error(`Error: Invalid .with argument`)
}

const buildObject = objectMapJoin(buildProperty)
const calls = mapJoin(buildCall(mapJoin(buildArg)))
