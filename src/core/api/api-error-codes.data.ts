const ApiErrorCodes: Record<
  string,
  {
    name: string
    description: string
  }
> = {
  ALREADY_EXISTS: {
    name: 'Уже существует',
    description: 'Данный элемент уже существует в системе'
  },
  'ASSIGNED_WORK.ALREADY_CHECKED': {
    name: 'Задание уже проверено',
    description:
      'Это действие может быть выполнено только для непроверенных заданий'
  },
  'ASSIGNED_WORK.ALREADY_SOLVED': {
    name: 'Задание уже выполнено',
    description:
      'Это действие может быть выполнено только для невыполненных заданий'
  },
  'ASSIGNED_WORK.INCORRECT_DEADLINE_SHIFT': {
    name: 'Некорректный сдвиг дедлайна',
    description: 'Проверьте правильность указанного значения сдвига дедлайна'
  },
  'ASSIGNED_WORK.NOT_CHECKED': {
    name: 'Задание не проверено',
    description:
      'Это действие может быть выполнено только для проверенных заданий'
  },
  'ASSIGNED_WORK.NOT_REMAKEABLE': {
    name: 'Задание невозможно переделать',
    description: 'Это задание больше невозможно переделать'
  },
  'ASSIGNED_WORK.NOT_SOLVED': {
    name: 'Задание не выполнено',
    description:
      'Это действие может быть выполнено только для выполненных заданий'
  },
  BAD_REQUEST: {
    name: 'Некорректный запрос',
    description: 'Проверьте правильность введенных данных'
  },
  CANT_CHANGE_ROLE: {
    name: 'Невозможно изменить роль',
    description: 'Изменить роль можно только у пользователей с ролью "ученик"'
  },
  CANT_SEND_EMAIL: {
    name: 'Ошибка отправки письма',
    description:
      'Не удалось отправить письмо. Попробуйте позже или свяжитесь с поддержкой'
  },
  FORBIDDEN: {
    name: 'Доступ запрещен',
    description: 'У вас нет прав доступа к этому ресурсу'
  },
  'GOOGLE_SHEETS_INTEGRATION.GOOGLE_PROBLEM': {
    name: 'Ошибка Google Sheets',
    description: 'Возникла ошибка при работе с Google Sheets. Попробуйте позже'
  },
  'GOOGLE_SHEETS_INTEGRATION.UNKNOWN_DATA_SELECTOR': {
    name: 'Неизвестный селектор данных',
    description: 'Проверьте правильность указанного селектора данных'
  },
  NOT_FOUND: {
    name: 'Не найдено',
    description: 'Запрашиваемый ресурс не найден'
  },
  NO_MENTOR_ASSIGNED: {
    name: 'Не назначен наставник',
    description: 'Для выполнения этого задания требуется наставник'
  },
  'STATISTICS.NO_STATISTICS_FOR_ROLE': {
    name: 'Нет статистики для роли',
    description: 'Статистика недоступна для указанной роли пользователя'
  },
  TOKEN_EXPIRED: {
    name: 'Токен истек',
    description: 'Пожалуйста, войдите в систему заново'
  },
  UNAUTHORIZED: {
    name: 'Запрос не авторизован',
    description: 'Пожалуйста, войдите в систему, чтобы продолжить'
  },
  UNSUPPORTED_MEDIA_TYPE: {
    name: 'Неподдерживаемый тип данных',
    description: 'Используемый формат файла не поддерживается'
  },
  USER_ALREADY_VOTED: {
    name: 'Вы уже проголосовали',
    description: 'Каждый пользователь может голосовать только один раз'
  },
  USER_IS_BLOCKED: {
    name: 'Пользователь заблокирован',
    description:
      'Обратитесь в поддержку для получения дополнительной информации'
  },
  USER_NOT_VERIFIED: {
    name: 'Пользователь не подтвержден',
    description: 'Пожалуйста, подтвердите свою почту для доступа к платформе'
  },
  NETWORK_ERROR: {
    name: 'Ошибка сети',
    description: 'Проверьте подключение к интернету'
  },
  fallback: {
    name: 'Неизвестная ошибка',
    description: 'Попробуйте позже или проверьте подключение к интернету'
  }
} as const

export { ApiErrorCodes }
