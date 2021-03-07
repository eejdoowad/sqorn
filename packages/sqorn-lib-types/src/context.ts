import { Parameter, Parameterize } from './parameter'

/** Properties inherited from Sqorn instance  */
export interface SqornContextProps {
  parameterize: Parameterize,
  escape: (str: string) => string,
  mapKey: (key: string) => string,
  build: (this: BaseContext, arg: any) => string,
}
/** Properties inherited from parent query */
export interface ParentContextProps {
  params: Parameter[],
  unparameterized: boolean,
}
/** Properties share by all contexts */
export interface BaseContext extends SqornContextProps, ParentContextProps {
  builderType: 'sq' | 'sql' | 'txt' | 'raw' | 'expression'
}