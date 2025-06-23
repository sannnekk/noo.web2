import type { ApiResponse } from '@/core/api/api.utils'
import type { WorkEntity } from '../api/work.types'

const workApiResponse: ApiResponse<WorkEntity> = {
  data: {
    id: 'work1',
    title: '8 пробник Реанимация математика 19.05 самопроверка',
    type: 'test',
    description: 'Это пробный тест по математике для подготовки к экзамену.',
    subjectId: 'subject1',
    subject: {
      id: 'subject1',
      name: 'Профильная математика',
      color: '#FF5733',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: null
    },
    tasks: [
      {
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
        rightAnswer: 'popa',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: {
          $type: 'delta',
          ops: [{ insert: 'Подумайте о новых технологиях.' }, { insert: '\n' }]
        },
        explanation: {
          $type: 'delta',
          ops: [
            {
              insert: 'Эссе должно содержать размышления о будущем математики.'
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: 'popa2',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '2',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
        id: 'task12',
        type: 'final-essay',
        order: 12,
        maxScore: 40,
        content: {
          $type: 'delta',
          ops: [
            {
              insert: 'Задача 12: Финальное эссе: "Математика как язык науки".'
            },
            { insert: '\n' }
          ]
        },
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '2x',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '3',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '15',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
        id: 'task19',
        type: 'text',
        order: 19,
        maxScore: 15,
        content: {
          $type: 'delta',
          ops: [
            {
              insert: 'Задача 19: Объясните, что такое дисперсия в статистике.'
            },
            { insert: '\n' }
          ]
        },
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '-2',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
        id: 'task23',
        type: 'word',
        order: 23,
        maxScore: 10,
        content: {
          $type: 'delta',
          ops: [{ insert: 'Задача 23: Вычислите 5!' }, { insert: '\n' }]
        },
        rightAnswer: '120',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
        id: 'task24',
        type: 'text',
        order: 24,
        maxScore: 15,
        content: {
          $type: 'delta',
          ops: [
            {
              insert: 'Задача 24: Опишите, что такое производная в математике.'
            },
            { insert: '\n' }
          ]
        },
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
        id: 'task25',
        type: 'word',
        order: 25,
        maxScore: 10,
        content: {
          $type: 'delta',
          ops: [
            {
              insert: 'Задача 25: Найдите наименьшее общее кратное чисел 6 и 8.'
            },
            { insert: '\n' }
          ]
        },
        rightAnswer: '24',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '0.5',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '25',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '6',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: '180',
        solveHint: null,
        explanation: null,
        checkStrategy: 'exact-match-or-zero',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
        solveHint: null,
        explanation: null,
        checkStrategy: 'manual',
        showAnswerBeforeCheck: false,
        checkOneByOne: false,
        createdAt: new Date('2025-05-01T10:00:00Z'),
        updatedAt: null
      },
      {
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
        rightAnswer: null,
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
  }
}

export { workApiResponse }
