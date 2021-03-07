import { build, BaseContext } from "@sqorn/lib-types";


// export const createExecutors: CreateExecutors = ({ db, mapOutputKeys }) => {
//   const executors: Executors = {
//     all: async (query, trx) => {

const createBuildable = () => ({
  [build](ctx: BaseContext): string {
    return ctx.build(this)
  }
})