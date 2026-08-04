<template>
  <div class="poll-participation-auth-view">
    <noo-title
      :size="4"
      class="poll-participation-auth-view__title"
    >
      Для того чтобы пройти опрос, пожалуйста, авторизируйтесь
    </noo-title>
    <div class="poll-participation-auth-view__options">
      <noo-auth-widget
        v-model:user="user"
        guest-hint="Войдите, чтобы ваши ответы были сохранены"
        @submit="start()"
      />
      <template v-if="!isAuthRequired">
        <div class="poll-participation-auth-view__options__separator">
          или
        </div>
        <noo-telegram-login-button />
      </template>
    </div>
    <noo-text-block
      dimmed
      size="small"
    >
      Ваши ответы будут привязаны к вашей учетной записи и не будут доступны
      другим пользователям.
    </noo-text-block>
    <noo-text-block
      v-if="!isAuthRequired"
      dimmed
      size="small"
    >
      При выборе опции "Войти через Telegram" мы не получаем доступ к вашим
      личным данным, кроме вашего имени и идентификатора Telegram. Ваши ответы
      будут привязаны к вашему Telegram-никнейму и не будут доступны другим
      пользователям.
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import type { UserEntity } from '@/modules/users/api/user.types'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePollParticipationStore } from '../stores/poll-participation.store'

const router = useRouter()
const participationStore = usePollParticipationStore()

const user = ref<UserEntity | null>(null)

const isAuthRequired = computed(
  () => participationStore.poll?.isAuthRequired ?? false
)

/**
 * The visitor confirmed who they are — remember them and move on to the
 * questions.
 */
function start(): void {
  if (!user.value) {
    return
  }

  participationStore.setParticipant({
    userType: 'authenticated-user',
    displayName: user.value.name
  })

  router.push({
    name: 'polls.participate.questions',
    params: { pollId: participationStore.poll?.id }
  })
}
</script>

<style lang="sass" scoped>
.poll-participation-auth-view
  &__title
    margin-top: 0

  &__options
    display: flex
    align-items: center
    justify-content: space-between
    gap: var(--space-s)
    margin-bottom: var(--space-l)

    // Side by side needs ~36rem; below that the card, the "или" and the
    // Telegram button stack instead of squeezing.
    +mobile
      flex-direction: column
      align-items: center
      text-align: center
</style>
