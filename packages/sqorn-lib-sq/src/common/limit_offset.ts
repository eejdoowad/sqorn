import {
  isTaggedTemplate,
  buildTaggedTemplate,
  TaggedTemplateArgs
} from '@sqorn/lib-util'
import { BaseContext } from '@sqorn/lib-types'

type Buildable = any
// type Args = TaggedTemplateArgs | [number | Buildable]

type BuildLimitOffset = (ctx: BaseContext, args: any[]) => string
export const buildLimitOffset: BuildLimitOffset = (ctx, args) => {
  if (isTaggedTemplate(args)) return buildTaggedTemplate(ctx, args)
  const arg = args[0]
  if (typeof arg === 'number') return ctx.parameterize(arg)
  if (typeof arg === 'function') return ctx.build(arg)
  throw Error('Error: Invalid limit/offset argument')
}
