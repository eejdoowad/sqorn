import { Executable, Buildable, Queryable, action } from '../capabilities'
import { ManualAction } from './action'
import { ManualMethods } from './methods'
import { BaseContext } from '../context';

export { ManualAction, ManualMethods }

export interface ManualBuilderConstructor {
  new(action?: ManualAction): ManualBuilder;
  prototype: ManualBuilder;
}

export interface ManualBuilder extends Buildable, Queryable, Executable, ManualMethods {
  type: 'manual'
  subtype: 'select'
  [action]?: ManualAction
}

declare let m: ManualBuilder

interface ManualBuilderConfig {}

export type CreateManualBuilder = (
  config: ManualBuilderConfig
) => ManualBuilderConstructor

export interface ManualContext extends BaseContext {
  separator: string,
  calls: ManualAction[]
}