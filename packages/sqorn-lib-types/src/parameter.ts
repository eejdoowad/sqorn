import { BaseContext } from './context'

export type Parameter = any
export type Parameterize = (this: BaseContext, arg: Parameter) => string
export type Escape = (arg: Parameter) => string
export type ParameterizedQuery = {
  text: string,
  args: Parameter[]
}
export type Row = { [field: string]: any }
export type MapString = (str: string) => string