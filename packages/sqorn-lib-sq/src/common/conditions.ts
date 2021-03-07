import {
  isTaggedTemplate,
  buildTaggedTemplate,
  isObject,
  mapJoin,
  objectMapJoin,
  BuildCall,
  BuildArg,
  BuildProperty,
  BuildObject
} from '@sqorn/lib-util'

const buildCall: BuildCall = callbackfn => (ctx, args) =>
  isTaggedTemplate(args)
    ? `(${buildTaggedTemplate(ctx, args)})`
    : callbackfn(ctx, args)

const buildArg: BuildArg = (ctx, arg) =>
  isObject(arg) ? buildObject(ctx, arg) : ctx.build(arg)

const valuesList = mapJoin((ctx, arg) => ctx.build(arg))

const buildProperty: BuildProperty = (ctx, key, value) => {
  const name = ctx.mapKey(key)
  if (value === null) return `(${name} is null)`
  if (Array.isArray(value)) return `(${name} in (${valuesList(ctx, value)}))`
  return `(${name} = ${ctx.build(value)})`
}

const buildObject: BuildObject = objectMapJoin(buildProperty, ' and ')
export const buildConditions = mapJoin(
  buildCall(mapJoin(buildArg, ' and ')),
  ' and '
)
