import {
  isObject,
  buildCall,
  mapJoin,
  objectMapJoin,
  BuildArg,
  BuildProperty,
  BuildObject
} from '@sqorn/lib-util'

const buildArg: BuildArg = (ctx, arg) => {
  if (typeof arg === 'string') return arg
  if (isObject(arg)) return buildObject(ctx, arg)
  return ctx.build(arg)
}

const buildProperty: BuildProperty = (ctx, key, value) => {
  const expression = typeof value === 'string' ? value : ctx.build(value)
  return `${expression} ${ctx.mapKey(key)}`
}

const buildObject: BuildObject = objectMapJoin(buildProperty)
export const buildExpressions = mapJoin(buildCall(mapJoin(buildArg)))
