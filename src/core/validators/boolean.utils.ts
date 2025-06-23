import type { ValidationError } from './validation-helpers.utils'

function isChecked(value: unknown): true | ValidationError[] {
  return value === true
    ? true
    : [{ kind: 'error', message: 'Это поле обязательно' }]
}

export { isChecked }
