export type SortDirection = 'Ascending' | 'Descending'

export type FilterPrimitive = string | number | boolean | Date

export interface QueryEntry {
  key: string
  value: string
}

export interface IPagination {
  page?: number
  pageSize?: number
  sort?: string
  sortDirection?: SortDirection
  filters?: IFilter[]
  search?: string
  toQuery: () => URLSearchParams
}

export interface IFilter {
  getKey: () => string
  getEntries: () => QueryEntry[]
}

class Pagination implements IPagination {
  public page: number
  public pageSize: number
  public sort?: string
  public sortDirection?: SortDirection
  public filters: IFilter[]
  public search?: string

  public constructor(
    page = 1,
    pageSize = 10,
    sort: string | undefined = undefined,
    sortDirection: SortDirection | undefined = 'Descending',
    filters: IFilter[] = [],
    search: string | undefined = undefined
  ) {
    this.page = page
    this.pageSize = pageSize
    this.sort = sort
    this.sortDirection = sortDirection
    this.filters = filters
    this.search = search
  }

  public toQuery(): URLSearchParams {
    const params: URLSearchParams = new URLSearchParams()

    if (this.page) {
      params.append('page', this.page.toString())
    }
    if (this.pageSize) {
      params.append('perPage', this.pageSize.toString())
    }
    if (this.sort) {
      params.append('sort', this.sort)
      params.append('sortBy', this.sortDirection ?? 'Descending')
    }
    if (this.search?.trim()) {
      params.append('search', this.search.trim())
    }

    if (this.filters.length) {
      this.filters.forEach((filter) => {
        filter.getEntries().forEach(({ key, value }) => {
          params.append(key, value)
        })
      })
    }

    return params
  }
}

class EqualsFilter<TValue extends FilterPrimitive> implements IFilter {
  private key: string
  private value: TValue

  constructor(key: string, value: TValue) {
    this.key = key
    this.value = value
  }

  getKey(): string {
    return this.key
  }

  getEntries(): QueryEntry[] {
    return [{ key: this.key, value: serializeFilterValue(this.value) }]
  }

  getValue(): TValue {
    return this.value
  }
}

class RangeFilter<TValue extends FilterPrimitive> implements IFilter {
  private key: string
  private min: TValue | null
  private max: TValue | null

  constructor(key: string, min: TValue | null, max: TValue | null) {
    this.key = key
    this.min = min
    this.max = max
  }

  getKey(): string {
    return this.key
  }

  getEntries(): QueryEntry[] {
    const entries: QueryEntry[] = []

    if (this.min !== null && this.min !== undefined) {
      entries.push({
        key: `${this.key}.Min`,
        value: serializeFilterValue(this.min)
      })
    }

    if (this.max !== null && this.max !== undefined) {
      entries.push({
        key: `${this.key}.Max`,
        value: serializeFilterValue(this.max)
      })
    }

    return entries
  }

  getValue(): { min: TValue | null; max: TValue | null } {
    return { min: this.min, max: this.max }
  }
}

class ArrayFilter<TValue extends FilterPrimitive> implements IFilter {
  private key: string
  private values: TValue[]

  constructor(key: string, values: TValue[]) {
    this.key = key
    this.values = values.filter(
      (value) => value !== null && value !== undefined
    )
  }

  getKey(): string {
    return this.key
  }

  getEntries(): QueryEntry[] {
    return this.values.map((value) => ({
      key: this.key,
      value: serializeFilterValue(value)
    }))
  }

  getValue(): TValue[] {
    return [...this.values]
  }
}

function serializeFilterValue(value: FilterPrimitive): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  return String(value)
}

export {
  ArrayFilter,
  EqualsFilter,
  Pagination,
  RangeFilter,
  serializeFilterValue
}
