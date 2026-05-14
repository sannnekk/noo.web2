import { z } from 'zod'

const AccountSettingsDraftSchema = z.object({
  name: z
    .string({
      required_error: 'Укажите имя и фамилию',
      invalid_type_error: 'Укажите имя и фамилию'
    })
    .min(2, { message: 'Имя должно содержать не менее 2 символов' })
    .max(100, { message: 'Имя не может быть длиннее 100 символов' }),
  username: z
    .string({
      required_error: 'Укажите никнейм',
      invalid_type_error: 'Укажите никнейм'
    })
    .min(3, { message: 'Никнейм не может быть короче 3 символов' })
    .max(20, { message: 'Никнейм не может быть длиннее 20 символов' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        'Никнейм может содержать только латинские буквы, цифры и символы _ и -'
    }),
  email: z
    .string({
      required_error: 'Укажите email',
      invalid_type_error: 'Укажите email'
    })
    .email({ message: 'Некорректный адрес электронной почты' })
})

export { AccountSettingsDraftSchema }
