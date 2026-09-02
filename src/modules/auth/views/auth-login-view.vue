<template>
  <div class="auth-login-view">
    <div class="auth-login-view__title">
      <noo-title
        :size="2"
        align="center"
      >
        Вход в личный кабинет
      </noo-title>
    </div>
    <div class="auth-login-view__hint">
      <noo-text-block
        align="center"
        size="medium"
      >
        Если Вы ещё не приобрели курсы, то можете это сделать в
        <noo-inline-link
          v-if="settings"
          :href="settings.shopLink"
        >
          нашем магазине
        </noo-inline-link>
        <template v-else> нашем магазине </template>
        .
      </noo-text-block>
    </div>
    <div class="auth-login-view__form">
      <div class="auth-login-view__form__input">
        <noo-text-input
          v-model="loginPayload.usernameOrEmail"
          label="Никнейм или e-mail"
          @enter-press="authStore.login.execute(loginPayload)"
        />
      </div>
      <div class="auth-login-view__form__input">
        <noo-text-input
          v-model="loginPayload.password"
          label="Пароль"
          type="password"
          @enter-press="authStore.login.execute(loginPayload)"
        />
      </div>
      <div class="auth-login-view__form__button">
        <noo-button
          variant="primary"
          size="medium"
          :is-loading="authStore.login.isLoading"
          @click="authStore.login.execute(loginPayload)"
        >
          Войти
        </noo-button>
      </div>
      <div
        v-if="authStore.externalProviders.data?.length"
        class="auth-login-view__form__providers"
      >
        <noo-text-block
          size="small"
          align="center"
          dimmed
        >
          или войдите через
        </noo-text-block>
        <noo-social-login-button
          v-for="provider in authStore.externalProviders.data"
          :key="provider.provider"
          :provider="provider.provider"
          :title="provider.displayName"
          :is-loading="authStore.startExternalAuth.isLoading"
          @click="
            authStore.startExternalAuth.execute({ provider: provider.provider })
          "
        />
      </div>
      <div class="auth-login-view__form__actions">
        <noo-text-block
          size="medium"
          align="center"
        >
          Ещё нет аккаунта?
          <noo-inline-link :to="{ name: 'auth.register' }">
            Зарегистрироваться
          </noo-inline-link>
          <br />
          Забыли пароль?
          <noo-inline-link :to="{ name: 'auth.forgot-password' }">
            Восстановить
          </noo-inline-link>
        </noo-text-block>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginPayload } from '@/core/api/endpoints/auth.types'
import { usePlatformSettings } from '@/core/stores/platform-settings.store'
import { useAuthStore } from '@/core/stores/auth.store'
import { onMounted, ref } from 'vue'

const settings = usePlatformSettings()

const loginPayload = ref<LoginPayload>({
  usernameOrEmail: '',
  password: ''
})

const authStore = useAuthStore()

onMounted(authStore.loadExternalProviders)
</script>

<style scoped lang="sass">
.auth-login-view
  &__form
    &__input
      margin: 0.3em 0

    &__button
      margin: 1em 0

      button
        width: 50%
        margin: 0 auto

        +mobile
          width: 100%

    &__providers
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.5em
      margin: 1em 0
</style>
