import type { WorkType } from '@/modules/works/api/work.types'

export interface StatisticsNumberBlockDto {
  title: string
  description?: string | null
  value?: number | null
  units?: string | null
  subValues?: Record<string, number | null> | null
}

export interface StatisticsGraphLineDto {
  name: string
  values: Record<string, number | null>
}

export interface StatisticsGraphDto {
  label: string
  lines: StatisticsGraphLineDto[]
}

export interface StatisticsDistributionEntryDto {
  label: string
  value: number
  /**
   * A stable key the client draws an icon for, e.g. `chrome` or `tablet`.
   * Keys the client does not know fall back to a generic icon.
   */
  icon?: string | null
}

export interface StatisticsDistributionDto {
  title: string
  description?: string | null
  entries: StatisticsDistributionEntryDto[]
}

export interface StatisticsBlockDto {
  title: string
  description?: string | null
  graph?: StatisticsGraphDto
  numberBlocks: StatisticsNumberBlockDto[]
  distributions?: StatisticsDistributionDto[]
}

export interface StatisticsDto {
  blocks: StatisticsBlockDto[]
}

export interface StatisticsQuery {
  workType?: WorkType
  from?: Date
  to?: Date
}
