<template>
  <div class="help-layout">
    <div class="help-layout__top-bar">
      <div class="help-layout__top-bar__inner container">
        <div class="help-layout__top-bar__inner__hint">
          <noo-text-block v-if="settings">
            Не нашли ответ на свой вопрос? Напишите нам в
            <noo-inline-link :href="settings.supportChatLink">
              {{ settings.supportChatName }}
            </noo-inline-link>
          </noo-text-block>
        </div>
        <div class="help-layout__top-bar__inner__actions">
          <noo-theme-toggle-widget />
        </div>
      </div>
    </div>
    <div class="help-layout__header">
      <div class="help-layout__header__inner container">
        <div class="help-layout__header__inner__logo">
          <router-link
            :to="{ name: 'help.home' }"
            aria-label="На главную страницу помощи"
          >
            <noo-support-logo />
          </router-link>
        </div>
        <div class="help-layout__header__inner__menu">
          <nav>
            <ul>
              <li>
                <router-link
                  :to="{ name: 'help.home' }"
                  class="help-layout__header__inner__menu__link"
                >
                  Главная
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'help.articles',
                    params: { category: 'courses' }
                  }"
                  class="help-layout__header__inner__menu__link"
                >
                  Курсы
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'help.articles',
                    params: { category: 'payment' }
                  }"
                  class="help-layout__header__inner__menu__link"
                >
                  Оплата
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'help.articles', params: { category: 'works' } }"
                  class="help-layout__header__inner__menu__link"
                >
                  Работы
                </router-link>
              </li>
              <li>
                <noo-button :to="{ name: 'root' }"> К платформе </noo-button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    <div class="help-layout__content">
      <div class="help-layout__content__inner container">
        <slot />
      </div>
    </div>
    <div class="help-layout__footer">
      <noo-footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlatformSettings } from '@/core/stores/platform-settings.store'

const settings = usePlatformSettings()
</script>

<style lang="sass" scoped>
.help-layout
  // Below `sm` the bootstrap container loses its max-width and falls back to a
  // 0.75rem gutter, which leaves the content all but touching the screen edge.
  // The app's own page gutter takes over there.
  +down(sm)
    .container
      padding-left: var(--page-gutter)
      padding-right: var(--page-gutter)

  &__top-bar
    padding-top: var(--space-2xs)

    &__inner
      display: flex
      justify-content: space-between
      align-items: center
      gap: var(--space-2xs)

      &__hint
        // Lets the sentence shrink and wrap inside its own cell instead of
        // pushing the theme toggle off the side of a phone.
        min-width: 0

        +mobile
          font-size: var(--step--2)

      &__actions
        flex-shrink: 0

  &__header
    &__inner
      padding: var(--space-s) 0 var(--space-l) 0
      display: flex
      align-items: center
      justify-content: space-between
      gap: var(--space-s)

      // Side by side there is room for the logo and five nav items; below that
      // the row is stacked and the nav wraps under the logo, both centred so
      // neither hangs off one edge of a narrow column.
      +tablet-down
        flex-direction: column
        align-items: center
        text-align: center
        gap: var(--space-xs)

      &__logo
        min-width: 0

        a
          display: inline-block
          text-decoration: none
          color: inherit
          transition: opacity 0.2s ease

          &:hover
            opacity: 0.75

      &__menu
        nav
          ul
            list-style: none
            margin: 0
            padding: 0
            display: flex
            flex-wrap: wrap
            gap: var(--space-2xs) var(--space-m)
            align-items: center
            justify-content: flex-end

            +tablet-down
              justify-content: center
              gap: var(--space-2xs) var(--space-s)

        &__link
          display: inline-block
          // Keeps a tapped link inside the app's minimum target height without
          // spacing the row out on a pointer device.
          line-height: var(--tap-target-size)
          text-decoration: none
          color: var(--form-text-color)
          text-transform: uppercase

          +tablet-down
            font-size: var(--step--1)

          &:hover
            color: var(--lila)

          &.router-link-exact-active
            color: var(--lila)
            font-weight: bold

  &__content
    padding: var(--space-l) 0
    background-color: var(--form-background)
</style>
