<template>
  <div class="auth-register-view">
    <div class="auth-login-view__title">
      <noo-title
        :size="2"
        align="center"
      >
        Регистрация
      </noo-title>
    </div>
    <div class="auth-register-view__form">
      <div class="auth-register-view__form__input">
        <noo-text-input
          v-model="registerPayload.name"
          v-model:is-valid="validations.name"
          label="Ваше имя"
          :validators="[(value) => isStringOfLength(value, 5, 100)]"
        />
      </div>
      <div class="auth-register-view__form__input">
        <noo-text-input
          v-model="registerPayload.username"
          v-model:is-valid="validations.username"
          label="Никнейм"
          :validators="[isValidUsername]"
        />
        <noo-username-exists-block :username="registerPayload.username" />
      </div>
      <div class="auth-register-view__form__input">
        <noo-text-input
          v-model="registerPayload.email"
          v-model:is-valid="validations.email"
          label="Электронная почта"
          type="email"
          :validators="[isValidEmail]"
        />
      </div>
      <div class="auth-register-view__form__input">
        <noo-text-input
          v-model="registerPayload.password"
          v-model:is-valid="validations.password"
          label="Пароль"
          type="password"
          :validators="[isValidPassword]"
        />
      </div>
      <div class="auth-register-view__form__input">
        <noo-text-input
          v-model="registerPayload.confirmPassword"
          v-model:is-valid="validations.confirmPassword"
          label="Подтверждение пароля"
          type="password"
          :validators="[arePasswordsEqual]"
        />
      </div>
      <div class="auth-register-view__form__checkbox">
        <noo-checkbox
          v-model="registerPayload.agreeToTerms"
          v-model:is-valid="validations.agreeToTerms"
          :validators="[isChecked]"
        >
          Я согласен с
          <noo-inline-link :href="AppConstants.privacyLink">
            Политикой конфиденциальности
          </noo-inline-link>
          и
          <noo-inline-link :href="AppConstants.termsLink">
            Условиями использования
          </noo-inline-link>
        </noo-checkbox>
      </div>
      <div class="auth-register-view__form__button">
        <noo-button
          variant="primary"
          size="medium"
          :is-loading="authStore.register.isLoading"
          :disabled="!isStateValid"
          @click="isStateValid && authStore.register.execute(registerPayload)"
        >
          Зарегистрироваться
        </noo-button>
      </div>
      <div class="auth-register-view__form__actions">
        <noo-text-block
          size="medium"
          align="center"
        >
          Уже есть аккаунт?
          <noo-inline-link :to="{ name: 'auth.login' }">
            Войти
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
import type { RegisterPayload } from '@/core/api/endpoints/auth.types'
import { AppConstants } from '@/core/config/constants.config'
import { useAuthStore } from '@/core/stores/auth.store'
import { isChecked } from '@/core/validators/boolean.utils'
import {
  isStringOfLength,
  isValidEmail,
  isValidPassword,
  isValidUsername
} from '@/core/validators/string.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed, ref } from 'vue'

const authStore = useAuthStore()

const registerPayload = ref<RegisterPayload>({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const validations = ref<
  Record<keyof RegisterPayload, ValidationError[] | true>
>({
  name: [],
  username: [],
  email: [],
  password: [],
  confirmPassword: [],
  agreeToTerms: []
})

const isStateValid = computed(() =>
  Object.values(validations.value).every((value) => value === true)
)

function arePasswordsEqual(): ValidationError[] | true {
  if (
    registerPayload.value.password !== registerPayload.value.confirmPassword
  ) {
    return [{ kind: 'error', message: 'Пароли не совпадают' }]
  }

  return true
}
</script>

<style scoped lang="sass">
.auth-register-view
  &__form
    &__input
      margin: 0.3em 0

    &__checkbox
      font-size: 0.9em
      margin: 1em 0

    &__button
      margin: 1em 0

      button
        width: 100%
        width: 50%
        margin: 0 auto
</style>
