const { camelCase, memoize } = require('sqorn-util')

/** Returns a new Sqorn SQL query builder */
module.exports = ({ adapter, dialect }) => (config = {}) => {
  const { newContext, queries, methods, properties } = dialect(config)
  const client = adapter(config)
  const reducers = createReducers(methods)
  const updateContext = applyReducers(reducers)
  reducers.extend = (ctx, args) => {
    for (const arg of args) updateContext(arg.method, ctx)
  }
  const builder = {}
  const chain = createBuilder(builder)
  Object.defineProperties(builder, {
    ...builderProperties({ chain, newContext, updateContext, queries }),
    ...(client && adapterProperties({ client, config })),
    ...methodProperties({ methods, chain }),
    ...properties,
    ...(client && client.properties)
  })
  return chain()
}

/** Creates a new builder instance */
const createBuilder = prototype => {
  const chain = method => {
    const fn = (...args) => chain({ name: 'express', args, prev: method })
    fn.method = method
    Object.setPrototypeOf(fn, prototype)
    return fn
  }
  return chain
}

/** Creates an object containing all method reducers */
const createReducers = methods => {
  const reducers = {}
  for (const name in methods) {
    const { updateContext, properties = {} } = methods[name]
    reducers[name] = updateContext
    // some methods have subproperties, e.g. .union.all
    for (const key in properties) {
      reducers[`${name}.${key}`] = properties[key]
    }
  }
  return reducers
}

/** Follows a method chain, applying each method's reducer, to ctx */
const applyReducers = reducers => (method, ctx) => {
  // follow method links to construct methods array (in reverse)
  const methods = []
  for (; method !== undefined; method = method.prev) {
    methods.push(method)
  }
  // build methods object by processing methods in call order
  for (let i = methods.length - 1; i >= 0; --i) {
    const method = methods[i]
    reducers[method.name](ctx, method.args)
  }
  return ctx
}

/** Default properties of all SQL Query Builders */
const builderProperties = ({ chain, newContext, updateContext, queries }) => ({
  _build: {
    value: function(inheritedContext) {
      const ctx = updateContext(this.method, newContext(inheritedContext))
      return queries[ctx.type](ctx)
    }
  },
  query: {
    get: function() {
      return this._build()
    }
  },
  extend: {
    value: function(...args) {
      return chain({ name: 'extend', args, prev: this.method })
    }
  }
})

const adapterProperties = ({
  client: { query, end, transaction },
  config: { thenable = true, mapOutputKeys = camelCase }
}) => {
  const mapKey = memoize(mapOutputKeys)
  const properties = {
    end: { value: end },
    one: {
      value: async function(trx) {
        const rows = await query(this.query, trx)
        return mapRowKeys(rows, mapKey)[0]
      }
    },
    all: {
      value: async function(trx) {
        const rows = await query(this.query, trx)
        return mapRowKeys(rows, mapKey)
      }
    },
    transaction: { value: transaction }
  }
  if (thenable) {
    properties.then = {
      value: function(resolve) {
        resolve(this.all())
      }
    }
  }
  return properties
}

const mapRowKeys = (rows, fn) =>
  rows.length === 0
    ? rows
    : rows.length === 1
      ? mapOneRowKeys(rows, fn)
      : mapMultipleRowsKeys(rows, fn)

const mapOneRowKeys = (rows, fn) => {
  const [row] = rows
  const out = {}
  for (const key in row) {
    out[fn(key)] = row[key]
  }
  return [out]
}

const mapMultipleRowsKeys = (rows, fn) => {
  const mapping = {}
  for (const key in rows[0]) {
    mapping[key] = fn(key)
  }
  return rows.map(row => {
    const mapped = {}
    for (const key in mapping) {
      mapped[mapping[key]] = row[key]
    }
    return mapped
  })
}

/** Builds object containing a property for every query building method */
const methodProperties = ({ methods, chain }) => {
  const properties = {}
  for (const name in methods) {
    const { getter, properties: props } = methods[name]
    if (getter) {
      // add getter methods
      properties[name] = {
        get: function() {
          return chain({ name, prev: this.method })
        }
      }
    } else if (props) {
      // certain builder methods are both callable and have subproperties
      // e.g. .union() and .union.all()
      const subBuilderPrototype = {}
      for (const key in props) {
        subBuilderPrototype[key] = function(...args) {
          return chain({
            name: `${name}.${key}`,
            args,
            prev: this.method
          })
        }
      }
      const subBuilder = function() {
        let fn = (...args) => chain({ name, args, prev: this.method })
        fn.method = this.method
        Object.setPrototypeOf(fn, subBuilderPrototype)
        return fn
      }
      properties[name] = {
        get: subBuilder
      }
    } else {
      // add function call methods
      properties[name] = {
        value: function(...args) {
          return chain({ name, args, prev: this.method })
        }
      }
    }
  }
  return properties
}
