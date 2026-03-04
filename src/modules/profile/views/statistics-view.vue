<template>
  <div class="statistics-view">
    <noo-title :size="3">Какая-то статистика</noo-title>
    <noo-bar-chart
      :data="shortData"
      :height="700"
      key-type="date"
    />
    <noo-line-chart
      :data="data"
      :height="400"
      key-type="date"
    />
    <noo-title :size="3">Устройства пользователей</noo-title>
    <noo-pie-chart
      :data="deviceData"
      :height="350"
      central-label="Устройства"
    />
    <noo-title :size="3">Браузеры пользователей</noo-title>
    <noo-pie-chart
      :data="browserData"
      :height="350"
      central-label="Браузеры"
    />
    <noo-title :size="3">Операционные системы</noo-title>
    <noo-pie-chart
      :data="osData"
      :height="350"
      central-label="ОС"
    />
  </div>
</template>

<script lang="ts" setup>
import type { BarChartData } from '@/components/charts/noo-bar-chart.vue'
import type { LineChartData } from '@/components/charts/noo-line-chart.vue'
import type { PieChartEntry } from '@/components/charts/noo-pie-chart.vue'

const shortData: BarChartData[] = [
  {
    key: '1',
    name: 'Статистика 1',
    color: 'var(--primary)',
    entries: {
      '2024-01-01': { value: 10, hint: 'Подсказка для 10' },
      '2024-02-01': { value: 20 },
      '2024-03-01': { value: 15 }
    }
  },
  {
    key: '2',
    name: 'Статистика 2',
    color: 'var(--secondary)',
    entries: {
      '2024-01-01': { value: 5 },
      '2024-02-01': { value: 25 },
      '2024-03-01': { value: 10 }
    }
  }
]

const data: LineChartData[] = [
  {
    key: 'chemistry',
    name: 'Химия',
    color: 'var(--primary)',
    entries: {
      '2024-01-01': { value: 78 },
      '2024-01-02': { value: 80 },
      '2024-01-03': { value: 82 },
      '2024-01-04': { value: 79 },
      '2024-01-05': { value: 83 },
      '2024-01-06': { value: 85 },
      '2024-01-07': { value: 84 },
      '2024-01-08': { value: 86 },
      '2024-01-09': { value: 88 },
      '2024-01-10': { value: 87 },
      '2024-01-11': { value: 89 },
      '2024-01-12': { value: 90 },
      '2024-01-13': { value: 88 },
      '2024-01-14': { value: 91 },
      '2024-01-15': { value: 92 },
      '2024-01-16': { value: 90 },
      '2024-01-17': { value: 93 },
      '2024-01-18': { value: 94 },
      '2024-01-19': { value: 92 },
      '2024-01-20': { value: 95 },
      '2024-01-21': { value: 96 },
      '2024-01-22': { value: 94 },
      '2024-01-23': { value: 93 },
      '2024-01-24': { value: 95 },
      '2024-01-25': { value: 96 },
      '2024-01-26': { value: 97 },
      '2024-01-27': { value: 95 },
      '2024-01-28': { value: 96 },
      '2024-01-29': { value: 97 },
      '2024-01-30': { value: 98 },
      '2024-01-31': { value: 97 }
    }
  },
  {
    key: 'math',
    name: 'Математика',
    color: 'var(--secondary)',
    entries: {
      '2024-01-01': { value: 70 },
      '2024-01-02': { value: 72 },
      '2024-01-03': { value: 74 },
      '2024-01-04': { value: 73 },
      '2024-01-05': { value: 76 },
      '2024-01-06': { value: 75 },
      '2024-01-07': { value: 77 },
      '2024-01-08': { value: 79 },
      '2024-01-09': { value: 78 },
      '2024-01-10': { value: 80 },
      '2024-01-11': { value: 82 },
      '2024-01-12': { value: 81 },
      '2024-01-13': { value: 83 },
      '2024-01-14': { value: 84 },
      '2024-01-15': { value: 85 },
      '2024-01-16': { value: 84 },
      '2024-01-17': { value: 86 },
      '2024-01-18': { value: 87 },
      '2024-01-19': { value: 88 },
      '2024-01-20': { value: 86 },
      '2024-01-21': { value: 89 },
      '2024-01-22': { value: 90 },
      '2024-01-23': { value: 91 },
      '2024-01-24': { value: 89 },
      '2024-01-25': { value: 92 },
      '2024-01-26': { value: 93 },
      '2024-01-27': { value: 94 },
      '2024-01-28': { value: 92 },
      '2024-01-29': { value: 95 },
      '2024-01-30': { value: 96 },
      '2024-01-31': { value: 94 }
    }
  },
  {
    key: 'biology',
    name: 'Биология',
    color: 'var(--danger)',
    entries: {
      '2024-01-01': { value: 82 },
      '2024-01-02': { value: 83 },
      '2024-01-03': { value: 81 },
      '2024-01-04': { value: 84 },
      '2024-01-05': { value: 86 },
      '2024-01-06': { value: 85 },
      '2024-01-07': { value: 87 },
      '2024-01-08': { value: 88 },
      '2024-01-09': { value: 89 },
      '2024-01-10': { value: 87 },
      '2024-01-11': { value: 90 },
      '2024-01-12': { value: 91 },
      '2024-01-13': { value: 89 },
      '2024-01-14': { value: 92 },
      '2024-01-15': { value: 93 },
      '2024-01-16': { value: 91 },
      '2024-01-17': { value: 94 },
      '2024-01-18': { value: 95 },
      '2024-01-19': { value: 93 },
      '2024-01-20': { value: 96 },
      '2024-01-21': { value: 95 },
      '2024-01-22': { value: 94 },
      '2024-01-23': { value: 96 },
      '2024-01-24': { value: 97 },
      '2024-01-25': { value: 96 },
      '2024-01-26': { value: 98 },
      '2024-01-27': { value: 97 },
      '2024-01-28': { value: 98 },
      '2024-01-29': { value: 97 },
      '2024-01-30': { value: 99 },
      '2024-01-31': { value: 98 }
    }
  }
]

const deviceData: PieChartEntry[] = [
  { label: 'Десктоп', value: 4520, color: 'var(--primary)' },
  { label: 'Мобильный', value: 3180, color: 'var(--secondary)' },
  { label: 'Планшет', value: 870, color: 'var(--warning)' }
]

const browserData: PieChartEntry[] = [
  { label: 'Chrome', value: 4100, color: 'var(--primary)' },
  { label: 'Safari', value: 2350, color: 'var(--secondary)' },
  { label: 'Firefox', value: 1120, color: 'var(--warning)' },
  { label: 'Edge', value: 680, color: 'var(--info)' },
  { label: 'Другие', value: 320, color: 'var(--danger)' }
]

const osData: PieChartEntry[] = [
  { label: 'Windows', value: 3600, color: 'var(--primary)' },
  { label: 'macOS', value: 2100, color: 'var(--secondary)' },
  { label: 'iOS', value: 1500, color: 'var(--warning)' },
  { label: 'Android', value: 1680, color: 'var(--info)' },
  { label: 'Linux', value: 690, color: 'var(--danger)' }
]
</script>
