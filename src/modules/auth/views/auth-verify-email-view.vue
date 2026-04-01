<template>
  <div class="auth-verify-email-view">
    <div
      v-if="state === 'loading'"
      class="auth-verify-email-view__loading"
    >
      <div class="auth-verify-email-view__loading__icon">
        <noo-loader-icon contrast />
      </div>
      <noo-title :size="4">Проверка Вашего email...</noo-title>
      <noo-text-block
        dimmed
        size="small"
      >
        Пожалуйста, подождите
      </noo-text-block>
    </div>
    <div
      v-else-if="state === 'success'"
      class="auth-verify-email-view__success"
    >
      <noo-title :size="4">Ваш email успешно подтвержден!</noo-title>
      <noo-button
        :to="{ name: 'auth.login' }"
        variant="primary"
      >
        Войти в аккаунт
      </noo-button>
    </div>
    <div
      v-else
      class="auth-verify-email-view__error"
    >
      <noo-error-block
        with-image
        no-margin
        centered
      >
        <noo-text-block>
          Произошла ошибка при подтверждении email. Пожалуйста, попробуйте снова
        </noo-text-block>
        <noo-button
          :to="{ name: 'auth.login' }"
          variant="secondary"
        >
          Войти в аккаунт
        </noo-button>
      </noo-error-block>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isApiError } from '@/core/api/api.utils'
import { onMounted, ref } from 'vue'
import { AuthService } from '@/core/api/endpoints/auth.service'

interface Props {
  token: string
}

const props = defineProps<Props>()

const state = ref<'loading' | 'success' | 'error'>('loading')

onMounted(async () => {
  // wait 2 seconds to show loading state
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const response = await AuthService.verifyEmail(props.token)

  state.value = isApiError(response) ? 'error' : 'success'
})
</script>

<style scoped lang="sass">
.auth-verify-email-view
  &__loading
    display: flex
    align-items: center
    justify-content: center
    flex-direction: column
    padding: 2em

    &__icon
       font-size: 3em

  &__success
    display: flex
    align-items: center
    justify-content: center
    flex-direction: column
    padding: 2em
</style>
