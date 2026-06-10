const historyStatus = {
  created: 'Работа создана',
  'started-solving': 'Работа начата',
  'solve-deadline-shifted': 'Дедлайн решения сдвинут',
  solved: 'Работа сдана на проверку',
  'started-checking': 'Проверка работы начата',
  'check-deadline-shifted': 'Дедлайн проверки сдвинут',
  checked: 'Работа проверена',
  'sent-on-recheck': 'Проверка отправлена на доработку',
  'sent-on-resolve': 'Решение отправлено на доработку'
} as const

export { historyStatus }
