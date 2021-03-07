import {
  Row,
  MapString,
  IDatabase,
  ITransaction,
  ParameterizedQuery,
  Executors,
  Executable
} from '@sqorn/lib-types'

type CreateExecutors = (config: {
  db: IDatabase;
  mapOutputKeys: MapString;
}) => ({
  executors: Executors,
  executable: Executable
})
export const createExecutors: CreateExecutors = ({ db, mapOutputKeys }) => {
  const executors: Executors = {
    all: async (query, trx) => {
      let rows = await (trx || db).query(query)
      return mapRowKeys(rows, mapOutputKeys)
    },
    first: async (query, trx) => {
      let rows = await (trx || db).query(query)
      return mapOneRowKeys(rows, mapOutputKeys)
    },
    one: async (query, trx) => {
      let rows = await (trx || db).query(query)
      if (rows.length === 0) throw Error('Error: 0 result rows')
      return mapOneRowKeys(rows, mapOutputKeys)
    },
    run: async (query, trx) => {
      await (trx || db).query(query)
    }
  }
  const { all, first, one, run } = executors
  const executable: Executable = {
    all(this: any, trx) {
      return all(this.query, trx)
    },
    first(this: any, trx) {
      return first(this.query, trx)
    },
    one(this: any, trx) {
      return one(this.query, trx)
    },
    run(this: any, trx) {
      return run(this.query, trx)
    }
  }
  return { executors, executable }
}

type MapRowKeys = (rows: Row[], fn: MapString) => Row[]
const mapRowKeys: MapRowKeys = (rows, fn) =>
  rows.length === 0
    ? rows
    : rows.length === 1
      ? [mapOneRowKeys(rows, fn)]
      : mapMultipleRowsKeys(rows, fn)

type MapOneRowKeys = (rows: Row[], fn: MapString) => Row
const mapOneRowKeys: MapOneRowKeys = (rows, fn) => {
  const [row] = rows
  const out: Row = {}
  for (const key in row) {
    out[fn(key)] = row[key]
  }
  return out
}

const mapMultipleRowsKeys: MapRowKeys = (rows, fn) => {
  const mapping: Row = {}
  for (const key in rows[0]) {
    mapping[key] = fn(key)
  }
  return rows.map(row => {
    const mapped: Row = {}
    for (const key in mapping) {
      mapped[mapping[key]] = row[key]
    }
    return mapped
  })
}
