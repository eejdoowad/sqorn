const { isTaggedTemplate } = require('sqorn-util')
const operators = require('./operators')

const ExpressionBuilder = ({ dialect }) => (config = {}) => {
  const builder = {
    _build(inherit) {
      const ctx = buildContext(inherit)
      const calls = buildCalls(this.current)
      return buildExpression(ctx, calls)
    },
    get query() {
      return this._build()
    }
  }
  const chain = createBuilder(builder)
  Object.defineProperties(builder, expressionProperties({ chain }))
  return chain()
}

function build(arg) {
  if (arg === undefined) throw Error('Invalid Query: undefined parameter')
  if (typeof arg === 'function') return arg._build(this)
  return `$${this.params.push(arg)}`
}

const buildContext = ({ params = [] } = {}) => {
  return { params, build }
}

// TODO: Performance optimization:
// inline expression building with this method so at most only one array
// is allocated in total, no array of object containing arrays nonsense
const buildCalls = current => {
  // get call nodes
  const calls = []
  for (; current; current = current.prev) calls.push(current)
  if (calls.length === 0) throw Error('Error: Empty expression')
  calls.reverse()
  // build expression list
  let expression = { name: 'arg', args: [] }
  const expressions = [expression]
  for (let i = 0; i < calls.length; ++i) {
    const { name, args } = calls[i]
    if (i === 0) {
      if (name) expression.name = name
      else pushCall(expression.args, args)
    } else {
      if (name) expressions.push((expression = { name, args: [undefined] }))
      else pushCall(expression.args, args)
    }
  }
  return expressions
}

const pushCall = (array, args) => {
  if (isTaggedTemplate(args)) {
    array.push({ tag: args })
  } else {
    if (args.length === 0)
      throw Error('Error: Expression call requires at least one argument')
    for (let i = 0; i < args.length; ++i) {
      array.push({ arg: args[i] })
    }
  }
}

const createExpressionBuilder = expressions => (ctx, calls) => {
  let exp
  for (let i = 0; i < calls.length; ++i) {
    const { name, args } = calls[i]
    const { build, minArgs, maxArgs } = expressions[name]
    if (i !== 0) args[0] = { exp }
    const numArgs = args.length
    if (numArgs < minArgs)
      throw Error(`Error: ${name} requires at least ${minArgs} arguments`)
    if (numArgs > maxArgs)
      throw Error(`Error: ${name} accepts at most ${maxArgs} arguments`)
    exp = build(ctx, args)
  }
  return exp
}

const createExpressions = () => {
  const expressions = {}
  Object.values(operators).forEach(operator => {
    expressions[operator.name] = operator
  })
  return expressions
}

const buildExpression = createExpressionBuilder(createExpressions())

const createBuilder = prototype => {
  const chain = current => {
    const fn = (...args) => chain({ prev: current, args })
    fn.current = current
    Object.setPrototypeOf(fn, prototype)
    return fn
  }
  return chain
}

const expressionProperties = ({ chain }) => {
  const properties = {}
  Object.values(operators).forEach(({ name }) => {
    properties[name] = {
      get: function() {
        return chain({ prev: this.current, name })
      }
    }
  })
  return properties
}

const e = ExpressionBuilder({})()

console.log(
  JSON.stringify(
    e(1, 2)
      .eq(3)
      .and(true).query,
    null,
    2
  )
)
