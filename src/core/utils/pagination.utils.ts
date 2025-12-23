export interface IPagination {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'ascending' | 'descending'
  filters?: IFilter[]
  toQuery: () => Record<string, string>
}

export interface IFilter {
  getQueryKey: () => string
  getQueryValue: () => string
}

class Pagination implements IPagination {
  public page: number
  public pageSize: number
  public sortBy?: string
  public sortDirection?: 'ascending' | 'descending'
  public filters: IFilter[]
  public search?: string

  public constructor(
    page = 1,
    pageSize = 10,
    sortBy: string | undefined = undefined,
    sortDirection: 'ascending' | 'descending' | undefined = 'descending',
    filters: IFilter[] = [],
    search: string | undefined = undefined
  ) {
    this.page = page
    this.pageSize = pageSize
    this.sortBy = sortBy
    this.sortDirection = sortDirection
    this.filters = filters
    this.search = search
  }

  public toQuery(): Record<string, string> {
    const params: URLSearchParams = new URLSearchParams()

    if (this.page) {
      params.append('Page', this.page.toString())
    }
    if (this.pageSize) {
      params.append('PerPage', this.pageSize.toString())
    }
    if (this.sortBy) {
      params.append('Sort', this.sortBy)
      params.append('SortBy', this.sortDirection ?? 'descending')
    }
    if (this.search) {
      params.append('Search', this.safeQueryString(this.search))
    }

    if (this.filters.length) {
      this.filters.forEach((filter) => {
        const key = filter.getQueryKey()
        const value = filter.getQueryValue()

        // OpenAPI schema uses direct query parameters (e.g. SolveStatus, SubjectId)
        // rather than a `filter.` prefix.
        params.append(key, value)
      })
    }

    return Object.fromEntries(params.entries())
  }

  private safeQueryString(query: string): string {
    return query.replace(/[^a-zA-Z0-9а-яА-ЯёЁ0-9\s]/g, '')
  }
}

class DateRangeFilter implements IFilter {
  private startDate: Date | null
  private endDate: Date | null
  private key: string

  constructor(key: string, startDate: Date | null, endDate: Date | null) {
    this.key = key
    this.startDate = startDate
    this.endDate = endDate
  }

  getQueryKey(): string {
    return this.key
  }

  getQueryValue(): string {
    const start = this.startDate ? this.startDate.toISOString() : 'null'
    const end = this.endDate ? this.endDate.toISOString() : 'null'

    return `date-range(${start},${end})`
  }
}

class BooleanFilter implements IFilter {
  private key: string
  private value: boolean

  constructor(key: string, value: boolean) {
    this.key = key
    this.value = value
  }

  getQueryKey(): string {
    return this.key
  }

  getQueryValue(): string {
    return this.value ? '1' : '0'
  }
}

class EnumFilter<Type extends string> implements IFilter {
  private key: string
  private value: Type

  constructor(key: string, value: Type) {
    this.key = key
    this.value = value
  }

  getQueryKey(): string {
    return this.key
  }

  getQueryValue(): string {
    return this.value.toString()
  }
}

export { BooleanFilter, DateRangeFilter, EnumFilter, Pagination }
