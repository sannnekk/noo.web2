import { RichTextSchema } from '@/core/utils/richtext.utils'
import { assertSchema } from '@/core/utils/zod.utils'
import { z } from 'zod'
import { SubjectSchema } from '../subjects/schemas'
import type { WorkTaskCheckStrategy, WorkType } from './api/work.types'
import type { PossiblyUnsavedWork, PossiblyUnsavedWorkTask } from './types'

const WorkTypeSchema = z.enum([
  'mini-test',
  'test',
  'trial-work',
  'phrase',
  'second-part'
])

const TaskTypeSchema = z.enum(['word', 'text', 'essay', 'final-essay'])

const CheckStrategySchema = z.enum([
  'manual',
  'exact-match-or-zero',
  'exact-match-with-wrong-character',
  'multiple-choice',
  'sequence'
])

const PossiblyUnsavedWorkTaskSchema = z.object({
  id: z.string().ulid().optional(),
  _entityName: z.literal('WorkTask'),
  _key: z.string(),
  content: RichTextSchema,
  order: z.number().int().nonnegative(),
  type: TaskTypeSchema,
  checkStrategy: CheckStrategySchema,
  maxScore: z
    .number()
    .int()
    .max(100, {
      message: 'Максимальный балл не может превышать 100'
    })
    .positive({
      message: 'Максимальный балл должен быть положительным'
    }),
  rightAnswers: z.array(z.string()).nullable(),
  explanation: RichTextSchema.nullable(),
  solveHint: RichTextSchema.nullable(),
  showAnswerBeforeCheck: z.boolean().default(false),
  checkOneByOne: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().nullable().optional()
})

const PossiblyUnsavedWorkSchema = z.object({
  id: z.string().ulid().optional(),
  _entityName: z.literal('Work'),
  _key: z.string(),
  title: z
    .string()
    .min(1, {
      message: 'Необходимо указать название работы'
    })
    .max(255, {
      message: 'Название работы не может превышать 255 символов'
    }),
  type: WorkTypeSchema,
  description: z.string().nullable(),
  subjectId: z.string().ulid().nullable(),
  subject: SubjectSchema.optional(),
  tasks: z.array(PossiblyUnsavedWorkTaskSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().nullable().optional()
})

assertSchema<WorkType, typeof WorkTypeSchema>(WorkTypeSchema)
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
