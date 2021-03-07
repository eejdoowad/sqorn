import { Context as BaseContext } from '@sqorn/lib-types'
import { isTaggedTemplate, buildTaggedTemplate } from './tagged_template'

export type BuildArg = (ctx: BaseContext, arg: any) => string
export type BuildArgs = (ctx: BaseContext, args: any[]) => string

export const isObject = (arg: any): boolean =>
  arg && arg.constructor && arg.constructor.prototype === Object.prototype

export type BuildCall = (callbackfn: BuildArgs) => BuildArgs
export const buildCall: BuildCall = callbackfn => (ctx, args) =>
  isTaggedTemplate(args)
    ? buildTaggedTemplate(ctx, args)
    : callbackfn(ctx, args)

type MapJoin = (callbackfn: BuildArg, separator?: string) => BuildArgs
export const mapJoin: MapJoin = (callbackfn, separator = ', ') => (
  ctx,
  args
) => {
  let txt = ''
  for (let i = 0; i < args.length; ++i) {
    if (i !== 0) txt += separator
    txt += callbackfn(ctx, args[i])
  }
  return txt
}

type MapJoinWrap = (
  callbackfn: BuildArg,
  separator?: string,
  open?: string,
  close?: string
) => BuildArgs
export const mapJoinWrap: MapJoinWrap = (
  callbackfn,
  separator = ', ',
  open = '(',
  close = ')'
) => (ctx, args) => {
  let txt = open
  for (let i = 0; i < args.length; ++i) {
    if (i !== 0) txt += separator
    txt += callbackfn(ctx, args[i])
  }
  return txt + close
}

export type BuildProperty = (
  ctx: BaseContext,
  key: string,
  value: any
) => string
export type BuildObject = (
  ctx: BaseContext,
  object: { [key: string]: any }
) => string
type ObjectMapJoin = (
  callbackfn: BuildProperty,
  separator?: string
) => BuildObject
export const objectMapJoin: ObjectMapJoin = (callbackfn, separator = ', ') => (
  ctx,
  object
) => {
  let txt = ''
  const keys = Object.keys(object)
  for (let i = 0; i < keys.length; ++i) {
    if (i !== 0) txt += separator
    const key = keys[i]
    txt += callbackfn(ctx, key, object[key])
  }
  return txt
}
