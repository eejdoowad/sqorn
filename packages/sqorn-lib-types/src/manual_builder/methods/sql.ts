import { ManualBuilder } from "..";
import { Parameter } from "../../parameter";

export type name = 'sql'
export interface methods {
  sql(...args: Parameter[]): ManualBuilder
  sql(strings: TemplateStringsArray, ...args: Parameter[]): ManualBuilder
}
type args1 = [...Parameter[]]
type args2 = [TemplateStringsArray, ...Parameter[]]
export type args = args1 | args2
