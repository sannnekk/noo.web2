import type { WorkTaskCheckStrategy, WorkTaskType } from './api/work.types'

const workTypes: { label: string; value: string }[] = [
  { label: 'Тест', value: 'test' },
  { label: 'Мини-зачет', value: 'mini-test' },
  { label: 'Вторая часть', value: 'second-part' },
  { label: 'Фраза', value: 'phrase' },
  { label: 'Пробник', value: 'trial-work' }
]

const taskTypes: { label: string; value: WorkTaskType; color: string }[] = [
  { label: 'В одну строку', value: 'word', color: 'var(--danger)' },
  { label: 'Открытый вопрос', value: 'text', color: 'var(--lila)' },
  { label: 'Сочинение', value: 'essay', color: 'var(--success)' },
  {
    label: 'Итоговое сочинение',
    value: 'final-essay',
    color: 'var(--warning)'
  },
  {
    label: 'Диктант',
    value: 'dictation',
    color: 'var(--dark)'
  }
]

const taskCheckStrategies: {
  label: string
  value: WorkTaskCheckStrategy
}[] = [
  { label: 'Вручную', value: 'manual' },
  { label: 'Точно совпадает или ноль', value: 'exact-match-or-zero' },
  {
    value: 'exact-match-with-wrong-character',
    label: 'Неверный символ минус балл'
  },
  { value: 'multiple-choice', label: 'Множественный выбор' },
  { value: 'sequence', label: 'Последовательность' }
]

export { taskCheckStrategies, taskTypes, workTypes }
