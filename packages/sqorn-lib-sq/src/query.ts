import { Parameter, SQContext } from '@sqorn/lib-types'
import {
  buildWith,
  buildSelect,
  buildFrom,
  buildWhere,
  buildGroupBy,
  buildHaving,
  buildSetOperator,
  buildOrderBy,
  buildLimit,
  buildOffset,
  buildDelete,
  buildReturning,
  buildInsert,
  buildUpdate,
  buildSet
} from './clauses'
import { BuildClause } from './common'

type Query = (
  ...clauses: BuildClause[]
) => (ctx: SQContext) => { text: string, args: Parameter[], type: string }
export const query: Query = (...clauses) => ctx => {
  let text = ''
  for (const clause of clauses) {
    const str = clause && clause(ctx)
    if (str) {
      if (text) text += ctx.separator
      text += str
    }
  }
  return { text, args: ctx.params, type: ctx.type }
}

export const queries = {
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
  update: query(buildWith, buildUpdate, buildSet, buildWhere, buildReturning),
  delete: query(buildWith, buildDelete, buildWhere, buildReturning),
  insert: query(buildWith, buildInsert, buildReturning)
}
