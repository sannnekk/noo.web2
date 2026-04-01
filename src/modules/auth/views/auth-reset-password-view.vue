<template>
  <div class="auth-reset-password-view">
    <noo-title :size="3">Сброс пароля</noo-title>
    <noo-text-block
      dimmed
      size="small"
    >
      Придумайте новый пароль для Вашего аккаунта
    </noo-text-block>
    <noo-text-input
      v-model="newPassword"
      v-model:is-valid="validations.password"
      label="Пароль"
      type="password"
      :validators="[isValidPassword]"
    />
    <noo-text-input
      v-model="repeatPassword"
      v-model:is-valid="validations.confirmPassword"
      label="Подтверждение пароля"
      type="password"
      :validators="[arePasswordsEqual]"
    />
    <div class="auth-reset-password-view__actions">
      <noo-button
        variant="primary"
        :disabled="!isStateValid"
        :is-loading="isLoading"
        @click="updatePassword()"
      >
        Обновить пароль
      </noo-button>
      <noo-inline-link
        :to="{ name: 'auth.login' }"
        size="small"
      >
        Вернуться к входу
      </noo-inline-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import { isValidPassword } from '@/core/validators/string.utils'
import { ref, computed } from 'vue'
import { AuthService } from '@/core/api/endpoints/auth.service'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { useRouter } from 'vue-router'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'

interface Props {
  token: string
}

const props = defineProps<Props>()

const uiStore = useGlobalUIStore()
const router = useRouter()

const newPassword = ref('')
const repeatPassword = ref('')

const isLoading = ref(false)

const validations = ref<{
  password: ValidationError[] | true
  confirmPassword: ValidationError[] | true
}>({ password: [], confirmPassword: [] })

const isStateValid = computed(() =>
  Object.values(validations.value).every((value) => value === true)
)

function arePasswordsEqual(): ValidationError[] | true {
  if (newPassword.value !== repeatPassword.value) {
    return [{ kind: 'error', message: 'Пароли не совпадают' }]
  }

  return true
}

async function updatePassword() {
  if (!isStateValid.value) {
    return
  }

  isLoading.value = true

  const response = await AuthService.resetPassword({
    token: props.token,
    newPassword: newPassword.value
  })

  isLoading.value = false

  if (isApiError(response)) {
    uiStore.createApiErrorToast('Ошибка при обновлении пароля', response.error)

    return
  }

  uiStore.createSuccessToast(
    'Пароль успешно обновлен. Пожалуйста, войдите в аккаунт с новым паролем'
  )
  router.replace({ name: 'auth.login' })
}
</script>

<style scoped lang="sass">
.auth-reset-password-view
  display: flex
  flex-direction: column
  align-items: stretch
  text-align: center

  &__actions
    display: flex
    flex-direction: column
    align-items: center
    margin-top: 1em

    a
      margin-top: 0.5em
</style>
