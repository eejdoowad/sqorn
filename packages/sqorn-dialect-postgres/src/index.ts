import { Dialect } from '@sqorn/lib-types'
import { createNewContext } from '@sqorn/lib-sq'
import { expressions } from './expressions'
import { methods, queries, properties } from './query'
import { parameterize, escape } from './parameterize'

export const dialect: Dialect = {
  expressions,
  sq: {
    createNewContext,
    methods,
    queries,
    properties
  },
  parameterize,
  escape
}
