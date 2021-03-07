import {
  Adapter,
  CreateDatabaseAdapter,
  ITransactionAdapter,
  ParameterizedQuery
} from '@sqorn/lib-types'

type Pool = any
type Client = any

const createDatabaseAdapter: CreateDatabaseAdapter = config => {
  const { pool } = config
  return {
    query: (query: ParameterizedQuery) => config.pool.query(query),
    connect: () => pool.connect()
  }
}

class TransactionAdapter implements ITransactionAdapter {
  _client: Client
  constructor({ client }: { client: Client }) {
    this._client = client
  }
  query(query: ParameterizedQuery) {
    return this._client.query(query)
  }
  begin() {
    return this._client.query('begin')
  }
  commit() {
    return this._client.query('commit')
  }
  rollback() {
    return this._client.query('rollback')
  }
  release() {
    return this._client.release()
  }
}

export const adapter: Adapter = {
  createDatabaseAdapter,
  TransactionAdapter
}

// export const adapter: CreateAdapter = ({ pg, pool }) => {
//   // if (!pool) return undefined
//   // if (!pg) throw Error('Sqorn missing argument "pg"')
//   return {
//     query: async ({ text, args }) => {
//       const result = await pool.query({ text, values: args })
//       return result.rows
//     },
//     transaction: {
//       query: async function(query) {
//         const result = await this.db.query(query)
//         return result.rows
//       },
//       callback: async fn => {
//         const client = await pool.connect()
//         try {
//           await client.query('begin')
//           const result = await fn(client)
//           await client.query('commit')
//           return result
//         } catch (e) {
//           await client.query('rollback')
//           throw e
//         } finally {
//           client.release()
//         }
//       },
//       object: async () => {
//         const client = await pool.connect()
//         await client.query('begin')
//         return {
//           query: client.query.bind(client),
//           commit: async () => {
//             try {
//               await client.query('commit')
//             } finally {
//               client.release()
//             }
//           },
//           rollback: async () => {
//             try {
//               await client.query('rollback')
//             } finally {
//               client.release()
//             }
//           }
//         }
//       }
//     }
//   }
// }
