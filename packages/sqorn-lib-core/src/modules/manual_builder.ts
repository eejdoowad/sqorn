import { CreateManualBuilder, build, ManualBuilderConstructor, ManualBuilder, ManualAction, ManualMethods, Executable, action, Queryable, Buildable, BaseContext, ManualContext } from '@sqorn/lib-types'


const chainable = <T extends string[]>(ctor: any, ...types: T): { [key in T[number]]: any } => {
  const out: any = []
  types.forEach(type => {
    out[type] = function(this: any, ...args: any){ return new ctor({ prev: this[action], type, args }) }
  })
  return out
}

type CreateManualBuilder2 = (config: {
  buildable: Buildable,
  queryable: Queryable,
  executable: Executable
}) => ManualBuilderConstructor
export const createManualBuilder2: CreateManualBuilder2 = ({
  queryable,
  executable
}) => {
  const ManualBuilder = function ManualBuilder(this: ManualBuilder, action_?: ManualAction) {
    this[action] = action_
  } as Function as ManualBuilderConstructor


  ManualBuilder.prototype = {
    type: 'manual',
    subtype: 'select',
    [build](context: BaseContext): string {
      const context = updateContext(this.method, newContext(inheritedContext))
      return queries[context.type](context)
    },
    ...queryable,
    ...executable,
    ...chainable(ManualBuilder, 'extend', 'link', 'sql'),
  }
  return ManualBuilder
}


const compile = (reducers, action?: ManualAction, context: ManualContext): string => {
  const actions: ManualAction[] = []
  for (; action !== undefined; action = action.prev) {
    actions.push(action)
  }
  // build actions object by processing actions in call order
  for (let i = actions.length - 1; i >= 0; --i) {
    const action = actions[i]
    reducers[action.name](ctx, action.args)
  }
  return ctx
}

const buildAction

export const createManualBuilder: CreateManualBuilder = ({
  defaultContext,
  query,
  adapter,
  config
}) => {
  const { queries, methods, properties } = query
  const newContext = createNewContext(defaultContext)
  const client = adapter(config)
  const reducers = createReducers(methods)
  const updateContext = applyReducers(reducers)
  reducers.extend = (ctx, args) => {
    const arr = Array.isArray(args[0]) ? args[0] : args
    for (let i = 0; i < arr.length; ++i) {
      updateContext(arr[i].method, ctx)
    }
  }
  const builder = () => {} // must not be object literal
  const chain = createChain(builder)

  Object.defineProperties(builder, {
    ...methodProperties({ methods, chain }),
    ...properties,
    ...(client && client.properties)
  })
  return chain()
}

/** Creates a new builder instance */
const createChain = prototype => {
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
    const { updateContext } = methods[name]
    reducers[name] = updateContext
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
  [build]: {
    value: function(inheritedContext) {
      const ctx = updateContext(this.method, newContext(inheritedContext))
      return queries[ctx.type](ctx)
    }
  },
  query: {
    get: function() {
      return this[build]()
    }
  },
  unparameterized: {
    get: function() {
      return this[build]({ unparameterized: true }).text
    }
  },
  extend: {
    value: function(...args) {
      return chain({ name: 'extend', args, prev: this.method })
    }
  }
})
