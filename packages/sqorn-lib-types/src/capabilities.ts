import { ParameterizedQuery, Row } from "./parameter";
import { ITransaction } from "./adapter";

export const build = Symbol.for('sqorn-build')
export const action = Symbol.for('sqorn-action')

export interface Buildable {
  [build](ctx: any): string;
}

export interface Queryable {
  query: ParameterizedQuery
  unparameterized: string;
}

export interface Executable {
  all(trx?: ITransaction): Promise<Row[]>
  first(trx?: ITransaction): Promise<Row | undefined>
  one(trx?: ITransaction): Promise<Row>
  run(trx?: ITransaction): Promise<void>
}

export interface Executors {
  all: (query: ParameterizedQuery, trx?: ITransaction) => Promise<Row[]>
  first: (query: ParameterizedQuery, trx?: ITransaction) => Promise<Row | undefined>
  one: (query: ParameterizedQuery, trx?: ITransaction) => Promise<Row>
  run: (query: ParameterizedQuery, trx?: ITransaction) => Promise<void>
}
