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
        <noo-inline-link :href="AppConstants.courseShopLink">
          нашем магазине
        </noo-inline-link>
        .
      </noo-text-block>
    </div>
    <div class="auth-login-view__form">
      <div class="auth-login-view__form__input">
        <noo-text-input
          v-model="loginPayload.usernameOrEmail"
          label="Никнейм или e-mail"
          @keyup.enter="authStore.login.execute(loginPayload)"
        />
      </div>
      <div class="auth-login-view__form__input">
        <noo-text-input
          v-model="loginPayload.password"
          label="Пароль"
          type="password"
          @keyup.enter="authStore.login.execute(loginPayload)"
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
      <div class="auth-login-view__form__actions">
        <noo-text-block
          size="medium"
          align="center"
        >
          Ещё нет аккаунта?
          <noo-inline-link :to="{ name: 'auth.register' }">
            Зарегистрироваться
          </noo-inline-link>
          . <br />
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
import { AppConstants } from '@/core/config/constants.config'
import { useAuthStore } from '@/core/stores/auth.store'
import { ref } from 'vue'

const loginPayload = ref<LoginPayload>({
  usernameOrEmail: '',
  password: ''
})

const authStore = useAuthStore()
</script>

<style scoped lang="sass">
.auth-login-view
  &__form
    &__input
      margin: 0.3em 0

    &__button
      margin: 1em 0

      button
        width: 100%
        width: 50%
        margin: 0 auto
</style>
