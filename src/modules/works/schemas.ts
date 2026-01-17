import { richTextIsEmpty, RichTextSchema } from '@/core/utils/richtext.utils'
import { assertSchema } from '@/core/utils/zod.utils'
import { z } from 'zod'
import { SubjectSchema } from '../subjects/schemas'
import type { WorkTaskCheckStrategy, WorkType } from './api/work.types'
import {
  workTaskCheckStrategyValues,
  workTaskTypeValues,
  workTypeValues
} from './api/work.types'
import type { PossiblyUnsavedWork, PossiblyUnsavedWorkTask } from './types'

const WorkTypeSchema = z.enum(workTypeValues, {
  required_error: 'Выберите тип работы',
  invalid_type_error: 'Выберите тип работы'
})

const TaskTypeSchema = z.enum(workTaskTypeValues, {
  required_error: 'Выберите тип задания',
  invalid_type_error: 'Выберите тип задания'
})

const CheckStrategySchema = z.enum(workTaskCheckStrategyValues, {
  required_error: 'Выберите тип проверки',
  invalid_type_error: 'Выберите тип проверки'
})

const RightAnswerSchema = z
  .string({
    required_error: 'Введите правильный ответ',
    invalid_type_error: 'Введите правильный ответ'
  })
  .min(1, {
    message: 'Введите правильный ответ'
  })

const PossiblyUnsavedWorkTaskSchema = z
  .object({
    id: z.string().ulid().optional(),
    _entityName: z.literal('WorkTask'),
    _key: z.string(),
    content: RichTextSchema.refine((value) => !richTextIsEmpty(value), {
      message: 'Введите текст задания'
    }),
    order: z.number().int().nonnegative(),
    type: TaskTypeSchema,
    checkStrategy: CheckStrategySchema,
    maxScore: z.coerce
      .number({
        required_error: 'Укажите максимальный балл',
        invalid_type_error: 'Укажите максимальный балл'
      })
      .int({
        message: 'Максимальный балл должен быть целым числом'
      })
      .min(1, {
        message: 'Максимальный балл должен быть больше нуля'
      })
      .max(100, {
        message: 'Максимальный балл не может превышать 100'
      }),
    rightAnswers: z
      .array(RightAnswerSchema, {
        required_error: 'Введите правильный ответ',
        invalid_type_error: 'Введите правильный ответ'
      })
      .nullable(),
    explanation: RichTextSchema.nullable(),
    solveHint: RichTextSchema.nullable(),
    showAnswerBeforeCheck: z.boolean().default(false),
    checkOneByOne: z.boolean().default(false),
    createdAt: z.date().optional(),
    updatedAt: z.date().nullable().optional()
  })
  .superRefine((task, ctx) => {
    const isAutoCheck = task.type === 'word'
    const answers = task.rightAnswers ?? []
    const hasValidAnswers = answers.some((answer) => answer.trim().length > 0)

    if (isAutoCheck && !hasValidAnswers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Добавьте хотя бы один правильный ответ',
        path: ['rightAnswers']
      })
    }
  })

const PossiblyUnsavedWorkSchema = z.object({
  id: z.string().ulid().optional(),
  _entityName: z.literal('Work'),
  _key: z.string(),
  title: z
    .string({
      required_error: 'Необходимо указать название работы',
      invalid_type_error: 'Необходимо указать название работы'
    })
    .min(1, {
      message: 'Необходимо указать название работы'
    })
    .max(255, {
      message: 'Название работы не может превышать 255 символов'
    }),
  type: WorkTypeSchema,
  description: z.string().nullable(),
  subjectId: z
    .string({
      required_error: 'Выберите предмет',
      invalid_type_error: 'Выберите предмет'
    })
    .min(1, {
      message: 'Выберите предмет'
    })
    .ulid({
      message: 'Выберите предмет'
    })
    .nullable()
    .refine((value) => value !== null && value !== '', {
      message: 'Выберите предмет'
    }),
  subject: SubjectSchema.optional(),
  tasks: z
    .array(PossiblyUnsavedWorkTaskSchema)
    .min(1, {
      message: 'Добавьте хотя бы одно задание'
    })
    .max(300, {
      message: 'Количество заданий не может превышать 300'
    }),
  createdAt: z.date().optional(),
  updatedAt: z.date().nullable().optional()
})

assertSchema<WorkTaskCheckStrategy, typeof CheckStrategySchema>(
  CheckStrategySchema
)
assertSchema<WorkType, typeof WorkTypeSchema>(WorkTypeSchema)
assertSchema<PossiblyUnsavedWork, typeof PossiblyUnsavedWorkSchema>(
  PossiblyUnsavedWorkSchema
)
assertSchema<PossiblyUnsavedWorkTask, typeof PossiblyUnsavedWorkTaskSchema>(
  PossiblyUnsavedWorkTaskSchema
)

export { PossiblyUnsavedWorkSchema, PossiblyUnsavedWorkTaskSchema }
