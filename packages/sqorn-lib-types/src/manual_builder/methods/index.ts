import * as Extend from './extend'
import * as Sql from './sql'
import * as Link from './link'
export { Sql, Extend, Link }
export interface ManualMethods
  extends Extend.methods, Sql.methods, Link.methods {}
