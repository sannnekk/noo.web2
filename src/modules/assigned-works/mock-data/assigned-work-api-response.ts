import type { ApiResponse } from '@/core/api/api.utils'
import type { AssignedWorkEntity } from '../api/assigned-work.types'

export const assignedWorkApiResponse: ApiResponse<AssignedWorkEntity> = {
  data: {
    _entityName: 'AssignedWork',
    id: '1',
    title: '8 пробник Реанимация математика 19.05 самопроверка',
    type: 'test',
    attempt: 1,
    solveStatus: 'solved',
    solveDeadlineAt: new Date('2025-06-24T12:00:00Z'),
    solvedAt: null,
    checkStatus: 'not-checked',
    checkDeadlineAt: new Date('2025-06-30T12:00:00Z'),
    checkedAt: null,
    workId: 'work1',
    work: {
      _entityName: 'Work',
      id: 'work1',
      title: '8 пробник Реанимация математика 19.05 самопроверка',
      type: 'test',
      description: 'Это пробный тест по математике для подготовки к экзамену.',
      subjectId: 'subject1',
      subject: {
        _entityName: 'Subject',
        id: 'subject1',
        name: 'Профильная математика',
        color: '#FF5733',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: null
      },
      tasks: [
        {
          _entityName: 'WorkTask',
          id: 'task1',
          type: 'word',
          order: 1,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 1: Найдите значение x, если 2x + 3 = 7.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['popa'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task2',
          type: 'text',
          order: 2,
          maxScore: 20,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 2: Опишите процесс решения уравнения.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task3',
          type: 'essay',
          order: 3,
          maxScore: 30,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 3: Напишите эссе на тему "Важность математики в жизни".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task4',
          type: 'final-essay',
          order: 4,
          maxScore: 40,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 4: Напишите финальное эссе на тему "Будущее математики".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task5',
          type: 'final-essay',
          order: 5,
          maxScore: 50,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 5: Напишите финальное эссе на тему "Будущее математики".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: {
            $type: 'delta',
            ops: [
              { insert: 'Подумайте о новых технологиях.' },
              { insert: '\n' }
            ]
          },
          explanation: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Эссе должно содержать размышления о будущем математики.'
              },
              { insert: '\n' }
            ]
          },
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task6',
          type: 'final-essay',
          order: 6,
          maxScore: 50,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 5: Напишите финальное эссе на тему "Будущее математики".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task7',
          type: 'final-essay',
          order: 7,
          maxScore: 50,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 5: Напишите финальное эссе на тему "Будущее математики".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task8',
          type: 'word',
          order: 8,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 8: Найдите значение x, если 2x + 3 = 7.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['popa2'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task9',
          type: 'text',
          order: 9,
          maxScore: 15,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 9: Опишите, как решать квадратные уравнения.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task10',
          type: 'word',
          order: 10,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 10: Решите уравнение x² - 4 = 0.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['2'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task11',
          type: 'essay',
          order: 11,
          maxScore: 25,
          content: {
            $type: 'delta',
            ops: [
              {
                insert: 'Задача 11: Напишите эссе о роли логики в математике.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task12',
          type: 'final-essay',
          order: 12,
          maxScore: 40,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 12: Финальное эссе: "Математика как язык науки".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task13',
          type: 'word',
          order: 13,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 13: Найдите производную функции f(x) = x².' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['2x'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task14',
          type: 'text',
          order: 14,
          maxScore: 20,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 14: Опишите метод подстановки в системах уравнений.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task15',
          type: 'word',
          order: 15,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 15: Найдите значение логарифма log₂(8).' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['3'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task16',
          type: 'essay',
          order: 16,
          maxScore: 30,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 16: Напишите эссе о применении математики в экономике.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task17',
          type: 'final-essay',
          order: 17,
          maxScore: 50,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 17: Финальное эссе: "Будущее математического образования".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task18',
          type: 'word',
          order: 18,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 18: Найдите x, если x/3 = 5.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['15'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task19',
          type: 'text',
          order: 19,
          maxScore: 15,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 19: Объясните, что такое дисперсия в статистике.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task20',
          type: 'word',
          order: 20,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              {
                insert: 'Задача 20: Найдите определитель матрицы [[1,2],[3,4]].'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['-2'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task21',
          type: 'essay',
          order: 21,
          maxScore: 30,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 21: Напишите эссе о значении математических моделей в науке.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task22',
          type: 'final-essay',
          order: 22,
          maxScore: 50,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 22: Финальное эссе: "Математика и искусственный интеллект".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task23',
          type: 'word',
          order: 23,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [{ insert: 'Задача 23: Вычислите 5!' }, { insert: '\n' }]
          },
          rightAnswers: ['120'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task24',
          type: 'text',
          order: 24,
          maxScore: 15,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 24: Опишите, что такое производная в математике.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task25',
          type: 'word',
          order: 25,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 25: Найдите наименьшее общее кратное чисел 6 и 8.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['24'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task26',
          type: 'essay',
          order: 26,
          maxScore: 30,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 26: Напишите эссе о применении тригонометрии в архитектуре.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task27',
          type: 'final-essay',
          order: 27,
          maxScore: 50,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 27: Финальное эссе: "Алгебра как основа программирования".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task28',
          type: 'word',
          order: 28,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 28: Найдите синус угла 30°.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['0.5'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task29',
          type: 'text',
          order: 29,
          maxScore: 20,
          content: {
            $type: 'delta',
            ops: [
              {
                insert: 'Задача 29: Объясните разницу между медианой и средним.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task30',
          type: 'word',
          order: 30,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 30: Найдите значение выражения 3² + 4².' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['25'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task31',
          type: 'essay',
          order: 31,
          maxScore: 25,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 31: Напишите эссе о математике в повседневной жизни.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task32',
          type: 'word',
          order: 32,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 32: Найдите x, если 3x = 18.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['6'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task33',
          type: 'text',
          order: 33,
          maxScore: 15,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 33: Опишите правила округления чисел.' },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task34',
          type: 'word',
          order: 34,
          maxScore: 10,
          content: {
            $type: 'delta',
            ops: [
              { insert: 'Задача 34: Сколько градусов в треугольнике?' },
              { insert: '\n' }
            ]
          },
          rightAnswers: ['180'],
          solveHint: null,
          explanation: null,
          checkStrategy: 'exact-match-or-zero',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task35',
          type: 'essay',
          order: 35,
          maxScore: 35,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 35: Напишите эссе о геометрии в искусстве и дизайне.'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        },
        {
          _entityName: 'WorkTask',
          id: 'task36',
          type: 'final-essay',
          order: 36,
          maxScore: 50,
          content: {
            $type: 'delta',
            ops: [
              {
                insert:
                  'Задача 36: Финальное эссе: "Математика будущего — вызовы и перспективы".'
              },
              { insert: '\n' }
            ]
          },
          rightAnswers: null,
          solveHint: null,
          explanation: null,
          checkStrategy: 'manual',
          showAnswerBeforeCheck: false,
          checkOneByOne: false,
          createdAt: new Date('2025-05-01T10:00:00Z'),
          updatedAt: null
        }
      ],
      createdAt: new Date('2025-05-01T10:00:00Z'),
      updatedAt: null
    },
    answers: [
      {
        _entityName: 'AssignedWorkAnswer',
        id: 'answer1',
        richTextContent: null,
        wordContent: 'Ответ на задание 1',
        taskId: 'task1',
        mentorComment: {
          $type: 'delta',
          ops: [
            { insert: 'Комментарий наставника к заданию 1.' },
            { insert: '\n' }
          ]
        },
        score: 10,
        detailedScore: null,
        maxScore: 10,
        status: 'submitted',
        createdAt: new Date('2025-06-01T10:00:00Z'),
        updatedAt: new Date('2025-06-01T10:00:00Z')
      },
      {
        _entityName: 'AssignedWorkAnswer',
        id: 'answer2',
        richTextContent: {
          $type: 'delta',
          ops: [
            { insert: 'Ответ на задание 2: ' },
            { insert: 'Это текстовое задание.' },
            { insert: '\n' }
          ]
        },
        wordContent: null,
        taskId: 'task2',
        mentorComment: {
          $type: 'delta',
          ops: [
            { insert: 'Комментарий наставника к заданию 2.' },
            { insert: '\n' }
          ]
        },
        score: 15,
        detailedScore: null,
        maxScore: 20,
        status: 'submitted',
        createdAt: new Date('2025-06-01T10:00:00Z'),
        updatedAt: new Date('2025-06-01T10:00:00Z')
      },
      {
        _entityName: 'AssignedWorkAnswer',
        id: 'answer3',
        richTextContent: {
          $type: 'delta',
          ops: [
            { insert: 'Ответ на задание 3: ' },
            { insert: 'Это текстовое задание.' },
            { insert: '\n' }
          ]
        },
        wordContent: null,
        taskId: 'task3',
        mentorComment: {
          $type: 'delta',
          ops: [
            { insert: 'Комментарий наставника к заданию 3.' },
            { insert: '\n' }
          ]
        },
        score: 0,
        detailedScore: null,
        maxScore: 30,
        status: 'submitted',
        createdAt: new Date('2025-06-01T10:00:00Z'),
        updatedAt: new Date('2025-06-01T10:00:00Z')
      }
    ],
    statusHistory: [],
    score: null,
    maxScore: 100,
    isArchivedByStudent: false,
    isArchivedByAssistants: false,
    isArchivedByMentors: false,
    createdAt: new Date('2025-06-01T10:00:00Z'),
    updatedAt: new Date('2025-06-01T10:00:00Z'),
    excludedTaskIds: [],
    studentCommentId: null,
    mainMentorCommentId: null,
    helperMentorCommentId: null,
    studentId: 'student1',
    student: {
      _entityName: 'User',
      id: 'student1',
      name: 'Иван Иванов',
      username: 'ivanov',
      email: 'abc@dd.de',
      role: 'student',
      telegramId: '123456789',
      telegramUsername: 'ivanov_telegram',
      isBlocked: false,
      isVerified: true,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: null
    },
    mainMentorId: 'mentor1',
    mainMentor: {
      _entityName: 'User',
      id: 'mentor1',
      name: 'Мария Петрова',
      username: 'petrova',
      email: 'petrova@example.com',
      role: 'mentor',
      telegramId: '987654321',
      telegramUsername: 'petrova_telegram',
      isBlocked: false,
      isVerified: true,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: null
    },
    helperMentorId: 'mentor2',
    helperMentor: {
      _entityName: 'User',
      id: 'mentor2',
      name: 'Алексей Смирнов',
      username: 'smirnov',
      email: 'smirnov@example.com',
      role: 'mentor',
      telegramId: '123456789',
      telegramUsername: 'smirnov_telegram',
      isBlocked: false,
      isVerified: true,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: null
    }
  }
}
