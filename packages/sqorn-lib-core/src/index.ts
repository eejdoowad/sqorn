import { CreateLibrary } from '@sqorn/lib-types'
import { createDatabase } from './modules/database'
import { createExecutors } from './mixins/executable'
import { createQueryBuilder } from './modules/any_builder'
import { createExpressionBuilder } from './modules/expression'
import { snakeCase, camelCase, memoize } from '@sqorn/lib-util'
import { createManualBuilder2 } from './modules/manual_builder'
const build = Symbol.for('sqorn-build')

/**
 * Creates a version of Sqorn for the given SQL dialect and database adapter.
 *
 * A dialect is variant of the SQL language,
 * while an adapter is the driver that communicates with the database.
 *
 * This design makes it easy to swap drivers, e.g. mysql vs mysql2 or
 * add new databases just by connecting a new adapter to an existing dialect.
 *
 */

const createLibrary: CreateLibrary = ({ dialect, adapter }) => (
  config = {}
) => {
  const { sq, expressions, parameterize, escape } = dialect

  //  Create default context properties passed through build tree
  const mapInputKeys = memoize(config.mapInputKeys || snakeCase)
  const mapOutputKeys = memoize(config.mapOutputKeys || camelCase)

  // Create database
  const db = createDatabase(adapter, config)

  // Create Executors
  const { executors, executable } = createExecutors({ db, mapOutputKeys })

  // Create Typed Query Builder
  // const defaultContext = { parameterize, escape, mapKey: mapInputKeys }
  // const sq = createQueryBuilder({ defaultContext, sq, adapter, config })

  // Create Manual Query Builder
  const manualBulder = createManualBuilder2({ executable })

  // Create Fragment Builder
  // const txt =

  // Create Raw String Builder
  const raw = arg => {
    if (typeof arg === 'string') return () => arg
    throw Error('Error: Raw argument must be string')
  }

  // Create Expression Builder
  const e = createExpressionBuilder({ defaultContext, expression, config })

  // Create Database API

  return { db, sql, txt, raw, sq, e }
}

function build(arg) {
  if (arg === undefined) throw Error('Error: undefined argument')
  if (arg && arg[build]) {
    const { type, text } = arg[build](this)
    if (type === 'expression') return text
    if (type === 'fragment') return text
    return `(${text})`
  }
  return this.unparameterized ? this.escape(arg) : this.parameterize(arg)
}

module.exports = createSqorn
