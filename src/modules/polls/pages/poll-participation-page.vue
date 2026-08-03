<template>
  <div class="poll-participation-page">
    <noo-swap-animation>
      <noo-error-block
        v-if="error"
        with-image
        centered
        :try-again="init"
      >
        <noo-title :size="3"> Не удалось загрузить опрос </noo-title>
        <noo-text-block v-if="error">
          {{ `${error.name}: ${error.description}` }}
        </noo-text-block>
      </noo-error-block>
      <div
        v-else-if="isLoading"
        class="poll-participation-page__loading"
      >
        <noo-loader-icon
          class="poll-participation-page__loading__icon"
          contrast
        />
        <noo-text-block class="poll-participation-page__loading__text">
          Загрузка опроса...
        </noo-text-block>
      </div>
      <div
        v-else-if="poll"
        class="poll-participation-page__content"
      >
        <div class="poll-participation-page__icon">
          <noo-icon name="poll" />
        </div>
        <noo-title
          :size="2"
          no-margin
        >
          {{ poll.title }}
        </noo-title>
        <noo-text-block v-if="poll.description">
          {{ poll.description }}
        </noo-text-block>
        <noo-title :size="4">
          Для того чтобы пройти опрос, пожалуйста, авторизируйтесь
        </noo-title>
        <div class="poll-participation-page__auth-options">
          <noo-auth-widget v-model:user="user" />
          <span>или</span>
          <noo-telegram-login-button>
            Войти через Telegram
          </noo-telegram-login-button>
        </div>
        <noo-text-block
          dimmed
          size="small"
        >
          Ваши ответы будут привязаны к вашей учетной записи и не будут доступны
          другим пользователям.
        </noo-text-block>
        <noo-text-block
          dimmed
          size="small"
        >
          При выборе опции "Войти через Telegram" мы не получаем доступ к вашим
          личным данным, кроме вашего имени и идентификатора Telegram. Ваши
          ответы будут привязаны к вашему Telegram-никнейму и не будут доступны
          другим пользователям.
        </noo-text-block>
      </div>
    </noo-swap-animation>
  </div>
</template>

<script setup lang="ts">
import { useApiRequest } from '@/core/composables/useApiRequest'
import { computed, onMounted, ref } from 'vue'
import { PollService } from '../api/poll.service'
import type { UserEntity } from '@/modules/users/api/user.types'

export interface PollParticipationPageProps {
  pollId: string
}

const props = defineProps<PollParticipationPageProps>()

const pollRequest = useApiRequest(() => PollService.getById(props.pollId))

const user = ref<UserEntity | null>(null)

const isLoading = computed(() => pollRequest.isLoading.value)
const error = computed(() => pollRequest.error.value)
const poll = computed(() => pollRequest.data.value)

async function init() {
  await pollRequest.execute()
}

onMounted(init)
</script>

<style lang="sass" scoped>
.poll-participation-page
  &__loading
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    // Tall enough to feel like the page, never taller than the phone screen
    // it is being read on.
    min-height: min(60vh, 25rem)
    width: 100%

    &__icon
      font-size: fluid(2rem, 3rem)

    &__text
      font-size: var(--step-0)

  &__icon
    font-size: fluid(3rem, 5rem)
    line-height: 1

  &__auth-options
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
