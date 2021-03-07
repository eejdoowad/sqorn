import {
  buildCall,
  mapJoin,
  objectMapJoin,
  BuildProperty
} from '@sqorn/lib-util'
import { BuildClause } from '../common'

export const buildSet: BuildClause = ctx => {
  if (!ctx.set) return ''
  const txt = calls(ctx, ctx.set)
  return txt && 'set ' + txt
}

const buildProperty: BuildProperty = (ctx, key, value) =>
  `${ctx.mapKey(key)} = ${value === undefined ? 'default' : ctx.build(value)}`

const calls = mapJoin(buildCall(mapJoin(objectMapJoin(buildProperty))))
