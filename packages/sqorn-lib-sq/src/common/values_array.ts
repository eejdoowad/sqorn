import { mapJoin, BuildArgs } from '@sqorn/lib-util'
import { BaseContext } from '@sqorn/lib-types'

type Value = any

type BuildValuesArray = (
  ctx: BaseContext,
  array: Value[]
) => { columns: string, values: string }
export const buildValuesArray: BuildValuesArray = (ctx, array) => {
  const keys = uniqueKeys(array)
  return {
    columns: buildColumns(ctx, keys),
    values: buildValues(ctx, array, keys)
  }
}

// gets unique keys in object array
type UniqueKeys = (array: Value[]) => string[]
const uniqueKeys: UniqueKeys = array => {
  const keys: { [key: string]: true } = {}
  for (const object of array) {
    for (const key in object) {
      keys[key] = true
    }
  }
  return Object.keys(keys)
}

// gets column string from unique keys of object array
const buildColumns: BuildArgs = mapJoin((ctx, arg) => ctx.mapKey(arg))

// gets values string of object array
type BuildValues = (ctx: BaseContext, source: Value[], keys: string[]) => string
const buildValues: BuildValues = (ctx, source, keys) => {
  let txt = 'values '
  for (let i = 0; i < source.length; ++i) {
    if (i !== 0) txt += ', '
    txt += '('
    const object = source[i]
    for (let j = 0; j < keys.length; ++j) {
      if (j !== 0) txt += ', '
      txt += buildValue(ctx, object[keys[j]])
    }
    txt += ')'
  }
  return txt
}

type BuildValue = (ctx: BaseContext, value: Value) => string
const buildValue: BuildValue = (ctx, arg) => {
  if (arg === undefined) return 'default'
  return ctx.build(arg)
}
