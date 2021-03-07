import { ManualBuilder } from '..'

export type name = 'extend'
export interface methods {
  extend(...builders: ManualBuilder[]): ManualBuilder;
  extend(builders: ManualBuilder[]): ManualBuilder;
}
type args1 = [...ManualBuilder[]]
type args2 = [ManualBuilder[]]
export type args = args1 | args2