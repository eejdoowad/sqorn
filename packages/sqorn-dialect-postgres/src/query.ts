import { Methods, Queries } from '@sqorn/lib-types'
import {
  methods as defaultMethods,
  queries as defaultQueries,
  query,
  clauses,
  common
} from '@sqorn/lib-sq'
import { BuildClause } from '@sqorn/lib-sq/lib/common'
const { buildFromItems, buildExpressions } = common
const {
  buildWith,
  buildFrom,
  buildWhere,
  buildGroupBy,
  buildHaving,
  buildSetOperator,
  buildOrderBy,
  buildLimit,
  buildOffset,
  buildReturning,
  buildSet
} = clauses

const postgresMethods = {}

// SELECT supports .distinctOn(...expressions)
const buildSelect: BuildClause = ctx => {
  let txt = 'select '
  if (ctx.distinct) {
    txt += 'distinct '
    if (ctx.distinct.length) {
      txt += `on (${buildExpressions(ctx, ctx.distinct)}) `
    }
  }
  txt += buildExpressions(ctx, ctx.ret) || '*'
  return txt
}
// DELETE: first .from call is used in the DELETE clause
// subsequent .from calls are used in the USING clause
const buildDelete: BuildClause = ctx => {
  const txt = buildFromItems(ctx, ctx.frm, 0, 1)
  return txt && `delete from ${txt}`
}
const buildUsing: BuildClause = ctx => {
  const txt = buildFromItems(ctx, ctx.frm, 1)
  return txt && `using ${txt}`
}
// UPDATE: first .from call is used in the UPDATE clause
// subsequent .from calls are used in the FROM clause
const buildUpdate: BuildClause = ctx => {
  const txt = buildFromItems(ctx, ctx.frm, 0, 1)
  return txt && `update ${txt}`
}
const buildUpdateFrom: BuildClause = ctx => {
  const txt = buildFromItems(ctx, ctx.frm, 1)
  return txt && `from ${txt}`
}

export const methods: Methods = { ...defaultMethods, ...postgresMethods }
export const queries: Queries = {
  ...defaultQueries,
  select: query(
    buildWith,
    buildSelect,
    buildFrom,
    buildWhere,
    buildGroupBy,
    buildHaving,
    buildSetOperator,
    buildOrderBy,
    buildLimit,
    buildOffset
  ),
  update: query(
    buildWith,
    buildUpdate,
    buildSet,
    buildUpdateFrom,
    buildWhere,
    buildReturning
  ),
  delete: query(buildWith, buildDelete, buildUsing, buildWhere, buildReturning)
}
export const properties = {
  rollup: {
    value: (...args: any[]) => {
      return {
        type: 'rollup',
        args
      }
    }
  },
  cube: {
    value: (...args: any[]) => {
      return {
        type: 'cube',
        args
      }
    }
  },
  groupingSets: {
    value: (...args: any[]) => {
      return {
        type: 'grouping sets',
        args
      }
    }
  }
}
