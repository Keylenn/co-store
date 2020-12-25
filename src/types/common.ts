const EMPTY_OBJ = {}

export type EmptyObj = typeof EMPTY_OBJ

export type TupleTail<T extends any[]> = ((...t: T) => void) extends (x: any, ...t: infer R) => void ? R : T
