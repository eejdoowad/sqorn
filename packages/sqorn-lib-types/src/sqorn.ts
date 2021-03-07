import { Adapter, IDatabase  } from "./adapter";
import { Dialect } from "./dialect";
import { MapString } from "./parameter";

interface LibraryConfig {
  dialect: Dialect
  adapter: Adapter
}
interface SqornConfig {
  pg?: any
  pool?: any
  mapInputKeys?: MapString
  mapOutputKeys?: MapString
}
interface Sqorn {
  db: IDatabase
  sql: any
  txt: any
  raw: any
  sq: any
  e: any
}

export type CreateSqorn = (config: SqornConfig) => Sqorn
export type CreateLibrary = (config: LibraryConfig) => CreateSqorn