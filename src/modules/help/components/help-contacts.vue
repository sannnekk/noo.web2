<template>
  <!--
    Every line of this block is a way of reaching support, so it waits for the
    settings as a whole rather than showing a card with nothing to act on.
  -->
  <section
    v-if="settings"
    class="help-contacts"
  >
    <help-decor
      class="help-contacts__decor"
      variant="band"
    />
    <div class="help-contacts__text">
      <noo-title
        :size="2"
        no-margin
      >
        Не нашли ответ?
      </noo-title>
      <noo-text-block no-margin>
        Напишите нам — разберёмся вместе. {{ settings.supportResponseTime }}.
      </noo-text-block>
      <noo-text-block
        dimmed
        size="small"
        no-margin
      >
        Вопросы по заданиям лучше задавать куратору в комментариях к работе — он
        видит вашу работу целиком.
      </noo-text-block>
    </div>
    <div class="help-contacts__actions">
      <noo-button
        :to="settings.supportChatLink"
        new-tab
      >
        Написать в Telegram
      </noo-button>
      <noo-inline-link
        :href="`mailto:${settings.supportEmail}`"
        dimmed
        size="small"
      >
        {{ settings.supportEmail }}
      </noo-inline-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePlatformSettings } from '@/core/stores/platform-settings.store'
import HelpDecor from './help-decor.vue'

const settings = usePlatformSettings()
</script>

<style scoped lang="sass">
.help-contacts
  position: relative
  isolation: isolate
  overflow: hidden
  display: flex
  align-items: center
  justify-content: space-between
  gap: var(--space-m)
  padding: var(--space-l) var(--space-m)
  border-radius: var(--border-radius)
  background-color: var(--light-background-color)

  +mobile
    flex-direction: column
    align-items: flex-start

  &__decor
    z-index: -1

  &__text
    display: flex
    flex-direction: column
    gap: var(--space-3xs)

  &__actions
    flex-shrink: 0
    display: flex
    flex-direction: column
    align-items: center
    gap: var(--space-2xs)
</style>
