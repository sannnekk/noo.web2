import type { LabelMap } from '@/components/utils/noo-patch-list.types'
import type {
  WorkTaskCheckStrategy,
  WorkTaskType,
  WorkType
} from './api/work.types'
import type { PossiblyUnsavedWork } from './types'

const workTypes: { label: string; value: WorkType }[] = [
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

const workPathLabels: LabelMap<PossiblyUnsavedWork> = {
  '/title': 'Название',
  '/type': 'Тип',
  '/description': 'Описание',
  '/subjectId': 'Предмет',
  '/tasks': 'Задания',
  '/tasks/*': (ctx) => `Задание №${ctx.value.order}`,
  '/tasks/*/type': (ctx) => `Тип задания №${ctx.entity.order}`,
  '/tasks/*/order': (ctx) => `Порядок задания №${ctx.entity.order}`,
  '/tasks/*/maxScore': (ctx) => `Макс. балл задания №${ctx.entity.order}`,
  '/tasks/*/content': (ctx) => `Текст задания №${ctx.entity.order}`,
  '/tasks/*/rightAnswers': (ctx) =>
    `Правильные ответы задания №${ctx.entity.order}`,
  '/tasks/*/solveHint': (ctx) => `Подсказка к заданию №${ctx.entity.order}`,
  '/tasks/*/explanation': (ctx) => `Пояснение к заданию №${ctx.entity.order}`,
  '/tasks/*/checkStrategy': (ctx) =>
    `Способ проверки задания №${ctx.entity.order}`,
  '/tasks/*/showAnswerBeforeCheck': (ctx) =>
    `Показывать ответ до сдачи работы в задании №${ctx.entity.order}`,
  '/tasks/*/checkOneByOne': (ctx) =>
    `Проверка по одному в задании №${ctx.entity.order}`
}

export { taskCheckStrategies, taskTypes, workPathLabels, workTypes }
