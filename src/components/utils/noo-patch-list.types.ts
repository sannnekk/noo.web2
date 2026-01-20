import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'

type Primitive = string | number | boolean | bigint | symbol

type Nil = null | undefined

type NonNullableValue<T> = T extends Nil ? never : T

type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

type ObjectChildMap<T> = {
  [K in keyof NonNullableValue<T> & string]?: PathLabelMap<
    NonNullableValue<T>[K]
  >
}

type ArrayChildMap<T> = PathLabelMap<ArrayElement<NonNullableValue<T>>>

/**
 * Describes how JSON Patch paths should be rendered in the UI.
 */
export type PathLabelMap<T> = T extends Primitive | Nil
  ? string | { label?: string }
  : T extends readonly unknown[]
    ?
        | string
        | ({ label?: string } & {
            '*'?: ArrayChildMap<T>
          } & ObjectChildMap<ArrayElement<T>>)
    :
        | string
        | ({ label?: string } & {
            '*'?: PathLabelMap<Record<string, unknown>>
          } & ObjectChildMap<T>)

export interface Change<T extends object> {
  label: string
  type: 'richtext' | 'date' | 'regular'
  pathKey: string
  operations: JsonPatchDocument<T>
  prevValue: unknown
  nowValue: unknown
}
