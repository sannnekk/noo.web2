import type { IFilter } from '@/core/utils/pagination.utils'

type FilterCtor<TFilter extends IFilter> = new (...args: never[]) => TFilter

function setFilter(
  filters: IFilter[] | undefined,
  key: string,
  filter: IFilter | null
): IFilter[] {
  const next = (filters ?? []).filter((item) => item.getKey() !== key)

  if (filter) {
    next.push(filter)
  }

  return next
}

function findFilter(
  filters: IFilter[] | undefined,
  key: string
): IFilter | undefined {
  return (filters ?? []).find((item) => item.getKey() === key)
}

function findFilterOfType<TFilter extends IFilter>(
  filters: IFilter[] | undefined,
  key: string,
  ctor: FilterCtor<TFilter>
): TFilter | undefined {
  const filter = findFilter(filters, key)

  if (!filter) {
    return undefined
  }

  return filter instanceof ctor ? filter : undefined
}

export { findFilter, findFilterOfType, setFilter, type FilterCtor }
