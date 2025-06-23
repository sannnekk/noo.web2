import { assertSchema } from '@/core/utils/zod.utils'
import { z } from 'zod'
import type { SubjectEntity } from './api/subject.types'

const SubjectSchema = z.object({
  id: z.string().ulid(),
  name: z
    .string()
    .min(1, {
      message: 'Необходимо указать название предмета'
    })
    .max(32, {
      message: 'Название предмета не может превышать 32 символов'
    }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Цвет должен быть в формате HEX'
  }),
  createdAt: z.date(),
  updatedAt: z.date().nullable()
})

assertSchema<SubjectEntity, typeof SubjectSchema>(SubjectSchema)

export { SubjectSchema }
