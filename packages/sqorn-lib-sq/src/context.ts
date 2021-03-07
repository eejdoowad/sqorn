import { CreateNewContext } from '@sqorn/lib-types'

export const createNewContext: CreateNewContext = defaultContext => {
  const { parameterize, escape, mapKey, build } = defaultContext

  return inherit => {
    const { params = [], unparameterized = false } = inherit || {}

    const whr: any[] = []
    return {
      // properties inherited from Sqorn instance
      parameterize,
      escape,
      mapKey,
      build,
      // properties inherited from parent query
      params,
      unparameterized,
      // properties of SQ subquery
      builderType: 'sq',
      type: 'select',
      separator: ' ',
      // shared
      ret: [],
      frm: [],
      whr,
      with: [],
      // select
      join: undefined,
      grp: [],
      hav: [],
      setop: [],
      ord: [],
      limit: [],
      offset: [],
      // update
      set: [],
      // insert
      insert: []
    }
  }
}
