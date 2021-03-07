import { BaseContext, SqornContextProps, ParentContextProps } from "../context";
import { Parameter } from "../parameter";

export interface FromItem {
  join: string,
  args: any[]
  on?: any[],
  using?: any[]
}

/** Properties of SQ Builder Context */
export interface AnyBuilderContext extends BaseContext {
  type: 'sq',
  subtype: 'select' | 'update' | 'delete' | 'insert' | 'values'
  separator: string,
  // shared
  ret: any[],
  frm: FromItem[],
  whr: any[],
  with: any[],
  recursive?: true,
  // select
  join?: FromItem
  distinct?: any[],
  grp: any[],
  hav: any[],
  setop: any[],
  ord: any[],
  limit: any[],
  offset: any[],
  // update
  set: any[],
  // delete
  delete?: true,
  // insert
  insert: any[],
}

export type CreateNewContext = (sqornCtx: SqornContextProps) => (parentCtx?: ParentContextProps) => AnyBuilderContext

export interface Methods {
  [method: string]: {
    getter?: true,
    updateContext: (ctx: AnyBuilderContext, args: Parameter[]) => void
  }
}