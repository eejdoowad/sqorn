import { Parameterize, Escape } from './parameter'
import { AnyBuilderConfig } from './any_builder'
import { ExpressionBuilderConfig } from './expression_builder'

export interface Dialect {
  escape: Escape;
  parameterize: Parameterize;
  sq: AnyBuilderConfig
  expressions: ExpressionBuilderConfig;
}
