
// type Obj = { [key: string]: any }
// type ObjectMap = <T>(object: { [key: string]: T }, mapfn: <U>())

type MapFn = <T>(value: T): infer R

type Readonly<T> = {
  [P in keyof T]: T[P];
}


export const objectMap = <T, U>(object: { [key: string]: T }, callbackfn: (value: T) => U): { [key: string]: U } => {
  const out: { [key: string]: U } = {}
  const keys = Object.keys(object)
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]
    const value = object[key]
    out[key] = callbackfn(value)
  }
  return out
}

const b = objectMap({ a: 2, b: 3 }, x => x)