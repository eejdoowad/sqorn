const createQueryBuilder = require('@sqorn/builder-sq')
const createExpressionBuilder = require('@sqorn/builder-expression')
const { snakeCase, memoize } = require('@sqorn/lib-util')
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

const createSqorn = ({ dialect, adapter }) => (config = {}) => {
  const { query, expression, parameterize, escape } = dialect

  //  Create default context properties passed through build tree
  const mapKey = memoize(config.mapInputKeys || snakeCase)
  const defaultContext = { parameterize, escape, mapKey, build }

  // Create Typed Query Builder
  const sq = createQueryBuilder({ defaultContext, query, adapter, config })

  // Create Manual Query Builder

  // Create Fragment Builder

  // Create Raw String Builder
  const raw = arg => {
    if (typeof arg === 'string') return () => arg
    throw Error('Error: Raw argument must be string')
  }

  // Create Expression Builder
  const e = createExpressionBuilder({ defaultContext, expression, config })

  return { sq, sql, txt, raw, e, db }
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
