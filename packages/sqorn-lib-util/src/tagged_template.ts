import { Context } from '@sqorn/lib-types'

export type TaggedTemplateArgs = [TemplateStringsArray, ...any[]]

// first argument of tagged template literal is array with property raw
type IsTaggedTemplate = (args: any[]) => args is TaggedTemplateArgs
export const isTaggedTemplate = <IsTaggedTemplate>(args =>
  Array.isArray(args[0]) && args[0].raw)

type BuildTaggedTemplate = (ctx: Context, [strings, ...args]: TaggedTemplateArgs) => string
export const buildTaggedTemplate: BuildTaggedTemplate = (ctx, [strings, ...args]) => {
  let txt = strings[0]
  for (let i = 0; i < args.length; ++i) {
    txt += ctx.build(args[i]) + strings[i + 1]
  }
  return txt
}
