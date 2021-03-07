import { BaseContext } from '@sqorn/lib-types'
import {
  isObject,
  buildCall,
  mapJoin,
  mapJoinWrap,
  BuildArg,
  BuildObject
} from '@sqorn/lib-util'
import { BuildClause } from '../common'

export const buildGroupBy: BuildClause = ctx => {
  if (ctx.grp.length === 0) return ''
  const txt = calls(ctx, ctx.grp)
  return txt && `group by ${txt}`
}

const buildArg: BuildArg = (ctx, arg) => {
  if (typeof arg === 'string') return arg
  if (typeof arg === 'function') return ctx.build(arg)
  if (Array.isArray(arg)) return buildArrayArg(ctx, arg)
  if (isObject(arg)) return buildObject(ctx, arg)
  throw Error('Invalid g by argument')
}

const buildArrayArg = mapJoinWrap(buildArg)

// postgres only
type BuildCubeOrRollupArg = (ctx: BaseContext, arg: any) => string
const buildCubeOrRollupArg: BuildCubeOrRollupArg = (ctx, arg) => {
  if (typeof arg === 'string') return arg
  if (typeof arg === 'function') return ctx.build(arg)
  if (Array.isArray(arg)) return buildCubeOrRollupArrayArg(ctx, arg)
  throw Error('Invalid cube/rollup argument')
}

// postgres only
// clone of buildArrayArg() without support for object args
const buildCubeOrRollupArrayArg = mapJoinWrap(buildCubeOrRollupArg)

// postgres only
const buildObject: BuildObject = (ctx, obj) => {
  const { type, args } = obj
  if (type === 'rollup') {
    return `rollup ${buildCubeOrRollupArg(ctx, args)}`
  }
  if (type === 'cube') {
    return `cube ${buildCubeOrRollupArg(ctx, args)}`
  }
  if (type === 'grouping sets') {
    return `grouping sets ${buildArg(ctx, args)}`
  }
  throw Error('Invalid group by argument')
}

const calls = mapJoin(buildCall(mapJoin(buildArg)))
