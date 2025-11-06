<template>
  <div class="help-layout">
    <div class="help-layout__top-bar">
      <div class="help-layout__top-bar__inner container">
        <div class="help-layout__top-bar__inner__hint">
          <noo-text-block>
            Не нашли ответ на свой вопрос? Напишите нам в
            <noo-inline-link :href="AppConstants.supportChatLink">
              {{ AppConstants.supportChatName }}
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
          <noo-support-logo />
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
                  :to="{ name: 'help.courses' }"
                  class="help-layout__header__inner__menu__link"
                >
                  Курсы
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'help.payment' }"
                  class="help-layout__header__inner__menu__link"
                >
                  Оплата
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'help.works' }"
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
import { AppConstants } from '@/core/config/constants.config'
</script>

<style lang="sass" scoped>
.help-layout
  &__top-bar
    &__inner
      display: flex
      justify-content: space-between
      align-items: center

  &__header
    &__inner
      padding: 1em 0 3em 0
      display: flex
      align-items: center
      justify-content: space-between

      &__menu
        height: 100%

        nav
          height: 100%

          ul
            list-style: none
            margin: 0
            padding: 0
            height: 100%
            display: flex
            gap: 2.5em
            align-items: center
            justify-content: flex-end

        &__link
          text-decoration: none
          color: var(--form-text-color)
          text-transform: uppercase

          &:hover
            color: var(--lila)

          &.router-link-exact-active
            color: var(--lila)
            font-weight: bold

  &__content
    padding: 2em 0
    background-color: var(--form-background)
</style>
