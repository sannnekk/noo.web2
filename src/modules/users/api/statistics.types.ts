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

export interface StatisticsBlockDto {
  title: string
  description?: string | null
  graph?: StatisticsGraphDto
  numberBlocks: StatisticsNumberBlockDto[]
}

export interface StatisticsDto {
  blocks: StatisticsBlockDto[]
}

export interface StatisticsQuery {
  workType?: WorkType
  from?: Date
  to?: Date
}
