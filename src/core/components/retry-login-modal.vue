<template>
  <noo-base-modal
    v-model:is-open="authStore.isRetryLoginModalVisible"
    :close-on-esc="false"
    :close-on-outside-click="false"
  >
    <template #title>
      <noo-title :size="2">Сессия завершена</noo-title>
    </template>
    <template #content>
      <div class="retry-login-modal__content">
        <noo-text-block
          dimmed
          size="small"
        >
          Ваша сессия в системе истекла. Введите пароль, чтобы войти снова, или
          выйдите полностью.
        </noo-text-block>
        <noo-text-block
          v-if="identity"
          no-margin
          size="small"
        >
          Вы вошли как <strong>{{ identity }}</strong>
        </noo-text-block>
        <noo-text-input
          v-model="password"
          label="Пароль"
          type="password"
          autocomplete="current-password"
          :errors="errorList"
          @enter-press="submit()"
        />
      </div>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        :disabled="authStore.retryLogin.isLoading"
        @click="logout()"
      >
        Выйти полностью
      </noo-button>
      <noo-button
        variant="primary"
        :is-loading="authStore.retryLogin.isLoading"
        :disabled="!password"
        @click="submit()"
      >
        Войти снова
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth.store'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed, shallowRef, unref, watch } from 'vue'

const authStore = useAuthStore()
const password = shallowRef('')

const identity = computed(
  () =>
    authStore.currentUser.data?.username ??
    authStore.currentUser.data?.email ??
    ''
)

const errorList = computed<ValidationError[]>(() => {
  const error = unref(authStore.retryLogin.error)

  return error
    ? [{ kind: 'error', message: error.description ?? error.name }]
    : []
})

function submit(): void {
  const usernameOrEmail =
    authStore.currentUser.data?.username ?? authStore.currentUser.data?.email

  if (!usernameOrEmail || !password.value) {
    return
  }

  authStore.retryLogin.execute({
    usernameOrEmail,
    password: password.value
  })
}

function logout(): void {
  authStore.logout.execute()
}

watch(
  () => authStore.isRetryLoginModalVisible,
  (visible) => {
    if (!visible) {
      password.value = ''
    }
  }
)
</script>

<style scoped lang="sass">
.retry-login-modal
  &__content
    display: flex
    flex-direction: column
    gap: 0.6em
    min-width: 18em
</style>
