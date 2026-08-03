<template>
  <div class="noo-auth-widget">
    <noo-swap-animation>
      <div
        v-if="authStore.isAuthenticated"
        class="noo-auth-widget__account"
      >
        <div class="noo-auth-widget__account__avatar">
          <noo-user-avatar
            :name="authStore.currentUser.data?.name ?? undefined"
            :avatar="authStore.currentUser.data?.avatar ?? undefined"
          />
        </div>
        <noo-text-block
          size="small"
          dimmed
          no-margin
          align="center"
        >
          Продолжить как
        </noo-text-block>
        <noo-title
          :size="3"
          align="center"
          class="noo-auth-widget__account__name"
          no-margin
        >
          {{ authStore.currentUser.data?.name }}
        </noo-title>
        <noo-button
          class="noo-auth-widget__account__submit"
          variant="primary"
          @click="emit('submit')"
        >
          Продолжить
        </noo-button>
        <noo-button
          variant="inline"
          size="small"
          :is-loading="authStore.logoutInPlace.isLoading"
          @click="switchAccount()"
        >
          Это не вы? Сменить аккаунт
        </noo-button>
      </div>
      <div
        v-else
        class="noo-auth-widget__guest"
      >
        <noo-text-block
          v-if="guestHint"
          size="small"
          dimmed
          no-margin
        >
          {{ guestHint }}
        </noo-text-block>
        <noo-button
          variant="primary"
          @click="isModalOpen = true"
        >
          <slot name="login-label">Войти через НОО.Платформу</slot>
        </noo-button>
      </div>
    </noo-swap-animation>
    <noo-base-modal v-model:is-open="isModalOpen">
      <template #title>
        <noo-title :size="2">Вход в личный кабинет</noo-title>
      </template>
      <template #content>
        <div class="noo-auth-widget__form">
          <noo-text-input
            v-model="credentials.usernameOrEmail"
            label="Никнейм или e-mail"
            autocomplete="username"
            @enter-press="submit()"
          />
          <noo-text-input
            v-model="credentials.password"
            label="Пароль"
            type="password"
            autocomplete="current-password"
            :errors="errors"
            @enter-press="submit()"
          />
          <noo-text-block
            size="small"
            dimmed
            no-margin
          >
            Забыли пароль?
            <noo-inline-link
              :to="{ name: 'auth.forgot-password' }"
              new-tab
            >
              Восстановить
            </noo-inline-link>
          </noo-text-block>
        </div>
      </template>
      <template #actions="{ close }">
        <noo-button
          variant="secondary"
          :disabled="authStore.loginInPlace.isLoading"
          @click="close()"
        >
          Отмена
        </noo-button>
        <noo-button
          variant="primary"
          :is-loading="authStore.loginInPlace.isLoading"
          :disabled="!isFilled"
          @click="submit()"
        >
          Войти
        </noo-button>
      </template>
    </noo-base-modal>
  </div>
</template>

<script setup lang="ts">
import type { LoginPayload } from '@/core/api/endpoints/auth.types'
import { useAuthStore } from '@/core/stores/auth.store'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import type { UserEntity } from '@/modules/users/api/user.types'
import { computed, ref, shallowRef, unref, watch, watchEffect } from 'vue'

interface Props {
  /** Shown next to the login button while nobody is signed in. */
  guestHint?: string
}

/** 'submit' — the signed-in user confirmed they want to go on as themselves. */
type Emits = (e: 'submit') => void

withDefaults(defineProps<Props>(), {
  guestHint: undefined
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()

/**
 * The signed-in user, mirrored out so a page can act on who is about to
 * perform the action without reaching into the auth store itself.
 */
const userModel = defineModel<UserEntity | null>('user', { default: null })

watchEffect(() => {
  userModel.value = authStore.isAuthenticated
    ? (authStore.currentUser.data ?? null)
    : null
})

const isModalOpen = shallowRef(false)

const credentials = ref<LoginPayload>({
  usernameOrEmail: '',
  password: ''
})

const isFilled = computed(
  () => !!credentials.value.usernameOrEmail && !!credentials.value.password
)

const errors = computed<ValidationError[]>(() => {
  const error = unref(authStore.loginInPlace.error)

  return error
    ? [{ kind: 'error', message: error.description ?? error.name }]
    : []
})

// `loginInPlace` only sets the session — the app-wide watcher on
// `isAuthenticated` is what loads the user behind the avatar, so the widget
// has nothing to fetch here.
async function submit(): Promise<void> {
  if (!isFilled.value || authStore.loginInPlace.isLoading) {
    return
  }

  await authStore.loginInPlace.execute(credentials.value)

  if (authStore.isAuthenticated) {
    isModalOpen.value = false
  }
}

// The old session is revoked before the form opens, so a visitor who changes
// their mind and closes the modal is left signed out rather than silently
// still signed in as somebody else.
async function switchAccount(): Promise<void> {
  await authStore.logoutInPlace.execute()

  isModalOpen.value = true
}

watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    credentials.value = { usernameOrEmail: '', password: '' }
    authStore.loginInPlace.error = null
  }
})
</script>

<style scoped lang="sass">
.noo-auth-widget
  &__account
    display: flex
    flex-direction: column
    align-items: center
    gap: var(--space-3xs)
    max-width: 20rem
    padding: var(--space-s)
    border: 1px solid var(--form-text-color)
    border-radius: var(--border-radius)
    background-color: var(--form-background)

    &__avatar
      font-size: 4rem
      padding: 3px
      margin-bottom: var(--space-3xs)
      border-radius: 50%
      background-color: var(--primary)

    &__name
      margin: 0
      padding: 0
      max-width: 100%
      white-space: nowrap
      text-overflow: ellipsis
      overflow: hidden

    &__username
      margin-bottom: var(--space-2xs)

    &__submit
      width: 100%

  &__guest
    display: flex
    align-items: center
    justify-content: space-between
    flex-wrap: wrap
    gap: var(--space-2xs)

  &__form
    display: flex
    flex-direction: column
    gap: var(--space-2xs)
</style>
