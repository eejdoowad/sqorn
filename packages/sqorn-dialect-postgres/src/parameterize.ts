import { Parameterize, Escape, MapString } from "@sqorn/lib-types"
import { isObject } from '@sqorn/lib-util'

/** Parameterizes the argument */
export const parameterize: Parameterize = function(this, arg) {
  if (arg === undefined) throw Error('Error: parameter is undefined')
  return `$${this.params.push(arg)}`
}

/** Escapes an argument for use in UNPARAMETERIZED queries. NOT SAFE AT ALL. */
export const escape: Escape = arg => {
  if (arg === undefined) throw Error('Error: parameter is undefined')
  if (arg === null) return 'null'
  if (typeof arg === 'string') return escapeLiteral(arg)
  if (typeof arg === 'number') return '' + arg
  if (typeof arg === 'boolean') return '' + arg
  if (typeof arg === 'object') {
    if (Array.isArray(arg)) {
      return `array[${arg.map(e => escape(e)).join(', ')}]`
    } else if (isObject(arg))  {
      return escapeLiteral(JSON.stringify(arg))
    }
  }
  throw Error(`Error: cannot escape invalid parameter`)
}

/** Based on https://github.com/brianc/node-postgres/blob/eb076db5d47a29c19d3212feac26cd7b6d257a95/lib/client.js#L351 */
const escapeLiteral: MapString = str => {
  let hasBackslash = false
  let escaped = "'"
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (c === "'") {
      escaped += c + c
    } else if (c === '\\') {
      escaped += c + c
      hasBackslash = true
    } else {
      escaped += c
    }
  }
  escaped += "'"
  if (hasBackslash === true) {
    escaped = ' E' + escaped
  }
  return escaped
}
