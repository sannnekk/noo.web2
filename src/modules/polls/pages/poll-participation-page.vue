<template>
  <div class="poll-participation-page">
    <noo-swap-animation>
      <noo-error-block
        v-if="participationStore.error"
        with-image
        centered
        :try-again="init"
      >
        <noo-title :size="3"> Не удалось загрузить опрос </noo-title>
        <noo-text-block>
          {{
            `${participationStore.error.name}: ${participationStore.error.description}`
          }}
        </noo-text-block>
      </noo-error-block>
      <div
        v-else-if="participationStore.isLoading"
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
        v-else-if="participationStore.poll"
        class="poll-participation-page__content"
      >
        <div class="poll-participation-page__header">
          <div class="poll-participation-page__header__icon">
            <noo-icon name="poll" />
          </div>
          <noo-title
            :size="2"
            no-margin
          >
            {{ participationStore.poll.title }}
          </noo-title>
          <noo-text-block v-if="participationStore.poll.description">
            {{ participationStore.poll.description }}
          </noo-text-block>
        </div>

        <noo-warning-block v-if="!participationStore.isAvailable">
          {{ participationStore.unavailabilityReason }}
        </noo-warning-block>
        <noo-animated-router-view v-else />
      </div>
    </noo-swap-animation>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { usePollParticipationStore } from '../stores/poll-participation.store'

export interface PollParticipationPageProps {
  pollId: string
}

const props = defineProps<PollParticipationPageProps>()

const participationStore = usePollParticipationStore()

async function init(): Promise<void> {
  await participationStore.init(props.pollId)
}

onMounted(init)

// The flow lives entirely in the store, so leaving the poll — rather than
// stepping between its views — is what discards the answers.
onBeforeUnmount(participationStore.reset)
</script>

<style lang="sass" scoped>
.poll-participation-page
  overflow: hidden

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

  &__header
    margin-bottom: var(--space-s)

    &__icon
      font-size: fluid(3rem, 5rem)
      line-height: 1
</style>
