<template>
  <div class="auth-forgot-password-view">
    <div class="auth-forgot-password-view__title">
      <noo-title
        :size="2"
        align="center"
      >
        Восстановление пароля
      </noo-title>
    </div>
    <div class="auth-login-view__hint">
      <noo-text-block
        align="center"
        size="medium"
      >
        Если Вы забыли пароль, то можете восстановить его, указав адрес
        электронной почты, с которым зарегистрированы в системе.
        <br>
        На указанный адрес будет отправлена ссылка для сброса пароля.
      </noo-text-block>
    </div>
    <div class="auth-forgot-password-view__form">
      <div class="auth-forgot-password-view__form__input">
        <noo-text-input
          v-model="email"
          v-model:is-valid="isValidState"
          type="email"
          label="Электронная почта"
          :validators="[isValidEmail]"
        />
      </div>
      <div class="auth-forgot-password-view__form__button">
        <noo-button
          size="medium"
          variant="primary"
          :is-loading="authStore.forgotPassword.isLoading"
          :disabled="isValidState !== true"
          @click="
            isValidState === true && authStore.forgotPassword.execute(email)
          "
        >
          Отправить ссылку для сброса пароля
        </noo-button>
      </div>
      <div class="auth-forgot-password-view__form__actions">
        <noo-text-block
          size="medium"
          align="center"
        >
          <noo-inline-link :to="{ name: 'auth.login' }">
            Войти
          </noo-inline-link>
          или
          <noo-inline-link :to="{ name: 'auth.register' }">
            Зарегистрироваться
          </noo-inline-link>
        </noo-text-block>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isValidEmail } from '@/core/validators/string.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const authStore = useAuthStore()

const email = ref('')
const isValidState = ref<true | ValidationError[]>([])
</script>

<style scoped lang="sass">
.auth-forgot-password-view
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
