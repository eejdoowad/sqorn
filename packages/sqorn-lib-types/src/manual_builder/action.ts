import { Sql, Extend, Link } from './methods'

interface SqlAction {
  prev?: ManualAction
  type: Sql.name
  args: Sql.args
}
interface ExtendAction {
  prev?: ManualAction
  type: Extend.name
  args: Extend.args
}
interface LinkAction {
  prev?: ManualAction
  type: Link.name
  args: Link.args
}

export type ManualAction = SqlAction | ExtendAction | LinkAction