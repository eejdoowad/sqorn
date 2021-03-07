import {
  ParameterizedQuery,
  ITransactionAdapterConstructor,
  ITransactionAdapter,
  ITransaction,
  CreateTransaction,
  IDatabase,
  Adapter
} from '@sqorn/lib-types'

const createTransactionClass = (
  TransactionAdapter: ITransactionAdapterConstructor
) =>
  class Transaction implements ITransaction {
    _adapter: ITransactionAdapter
    constructor(config: any) {
      this._adapter = new TransactionAdapter(config)
    }
    query(query: ParameterizedQuery) {
      return this._adapter.query(query)
    }
    begin() {
      return this._adapter.begin()
    }
    commit() {
      return this._adapter.commit()
    }
    rollback() {
      return this._adapter.rollback()
    }
    release() {
      return this._adapter.release()
    }
  }

export const createDatabase = (adapter: Adapter, config: any): IDatabase => {
  // Database Setup
  const { query, connect } = adapter.createDatabaseAdapter(config)

  // Transaction Setup
  const Transaction = createTransactionClass(adapter.TransactionAdapter)
  const transactionObject = async () =>
    new Transaction({ client: await connect() })
  const transactionCallback = async <T>(
    callbackfn: (transaction: ITransaction) => Promise<T>
  ): Promise<T> => {
    const transaction = await transactionObject()
    try {
      await transaction.begin()
      const result = await callbackfn(transaction)
      await transaction.commit()
      return result
    } catch (e) {
      await transaction.rollback()
      throw e
    } finally {
      transaction.release()
    }
  }
  const transaction: CreateTransaction = <T>(
    callbackfn?: (transaction: ITransaction) => Promise<T>
  ): Promise<ITransaction> | Promise<T> =>
    callbackfn ? transactionCallback(callbackfn) : transactionObject()

  return {
    query,
    transaction
  }
}
