<template>
  <div
    v-if="hasPage"
    class="noo-hotkey-widget"
  >
    <button
      ref="anchor"
      type="button"
      class="noo-hotkey-widget__button"
      title="Горячие клавиши"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <noo-icon name="keyboard" />
    </button>
    <!--
      Teleported because the header hides its overflow, which would clip a panel
      drawn inside it. See useAnchoredPanel for how it is placed once it is out.
    -->
    <teleport to="body">
      <transition name="noo-hotkey-widget__pop">
        <div
          v-if="isOpen"
          ref="panel"
          class="noo-hotkey-widget__panel"
          :style="panelStyle"
          role="dialog"
          aria-label="Горячие клавиши"
        >
          <div
            v-for="group in groups"
            :key="group.title"
            class="noo-hotkey-widget__panel__group"
          >
            <h3 class="noo-hotkey-widget__panel__group__title">
              {{ group.title }}
            </h3>
            <ul class="noo-hotkey-widget__panel__group__list">
              <li
                v-for="hotkey in group.hotkeys"
                :key="hotkey.combo"
                class="noo-hotkey-widget__panel__group__list__item"
              >
                <span class="noo-hotkey-widget__panel__group__list__item__keys">
                  <kbd
                    v-for="(key, index) in hotkey.keys"
                    :key="index"
                  >
                    {{ key }}
                  </kbd>
                </span>
                <span
                  class="noo-hotkey-widget__panel__group__list__item__description"
                >
                  {{ hotkey.description }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useAnchoredPanel } from '@/core/composables/useAnchoredPanel'
import {
  useHotkeys,
  useRegisteredHotkeys,
  type RegisteredHotkey
} from '@/core/composables/useHotkeys'
import { onClickOutside, useEventListener } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'

const anchor = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const isOpen = shallowRef(false)

const { page, global, hasPage } = useRegisteredHotkeys()

const { style: panelStyle } = useAnchoredPanel({
  anchor,
  panel,
  isOpen,
  align: 'right'
})

const groups = computed<{ title: string; hotkeys: RegisteredHotkey[] }[]>(() =>
  [
    { title: 'На этой странице', hotkeys: page.value },
    { title: 'Везде', hotkeys: global.value }
  ].filter((group) => group.hotkeys.length > 0)
)

// The way in from the keyboard, and only worth having where the page has
// something to show.
useHotkeys(() => [
  {
    combo: '?',
    description: 'Показать горячие клавиши',
    scope: 'global' as const,
    when: () => hasPage.value,
    handler: () => {
      isOpen.value = !isOpen.value
    }
  }
])

onClickOutside(panel, () => (isOpen.value = false), { ignore: [anchor] })

useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (isOpen.value && event.key === 'Escape') {
    isOpen.value = false
  }
})
</script>

<style scoped lang="sass">
.noo-hotkey-widget
  position: relative

  &__button
    padding: 0.2em
    font-size: 1.7em
    display: flex
    justify-content: center
    align-items: center
    border-radius: 0.5em
    background-color: transparent
    cursor: pointer
    border: none
    color: var(--form-text-color)

    &:hover
      background-color: var(--light)

.noo-hotkey-widget__panel
  z-index: 1000
  min-width: 18em
  max-width: min(90vw, 26em)
  padding: 0.8em
  background-color: var(--form-background)
  border: 1px solid var(--border-color)
  border-radius: var(--border-radius)
  box-shadow: var(--block-shadow)

  &__group + &__group
    margin-top: 0.8em

  &__group
    &__title
      margin: 0 0 0.5em
      font-size: 0.8rem
      font-weight: 500
      color: var(--text-light)

    &__list
      list-style: none
      margin: 0
      padding: 0

      &__item
        display: flex
        align-items: baseline
        gap: 0.6em
        padding: 0.25em 0

        &__keys
          display: flex
          gap: 0.2em
          flex-shrink: 0

          kbd
            font-family: inherit
            font-size: 0.7rem
            line-height: 1.4
            padding: 0.15em 0.45em
            border: 1px solid var(--border-color)
            border-bottom-width: 2px
            border-radius: 4px
            background-color: var(--light)
            color: var(--form-text-color)
            white-space: nowrap

        &__description
          font-size: 0.8rem
          color: var(--form-text-color)

.noo-hotkey-widget__pop-enter-active,
.noo-hotkey-widget__pop-leave-active
  transition: opacity 0.12s ease, transform 0.12s ease

.noo-hotkey-widget__pop-enter-from,
.noo-hotkey-widget__pop-leave-to
  opacity: 0
  transform: translateY(-0.3em)
</style>
