import { Parameter, ParameterizedQuery, Row } from './parameter'

type Client = unknown

export type CreateDatabaseAdapter = (config: { [key: string]: any}) => IDatabaseAdapter
export interface IDatabaseAdapter {
  query(query: ParameterizedQuery): Promise<Row[]>
  connect(): Promise<Client>
}
export interface ITransactionAdapterConstructor {
  new(config: any): ITransactionAdapter
}
export interface ITransactionAdapter {
  query(query: ParameterizedQuery): Promise<Row[]>
  begin(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
  release(): Promise<void>
}

export interface Adapter {
  createDatabaseAdapter: CreateDatabaseAdapter
  TransactionAdapter: ITransactionAdapterConstructor
}

export interface CreateTransaction {
  (): Promise<ITransaction>;
  <T>(callbackfn: (transaction: ITransaction) => Promise<T>): Promise<T>;
}

export interface IDatabase {
  query(query: ParameterizedQuery): Promise<Row[]>
  transaction: CreateTransaction
}

export interface ITransaction {
  query(query: ParameterizedQuery): Promise<Row[]>
  begin(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
  release(): Promise<void>
}

// export interface Transaction {
//   /**
//    * 
//    */
//   query(query: ParameterizedQuery): Promise<Row>;

//   /**
//    * Commits the transaction
//    */
//   commit(): Promise<void>;

//   /**
//    * Rolls back the transaction
//    */
//   rollback(): Promise<void>;
// }

// export type CreateAdapter = (config: { [key: string]: any }) => Adapter

