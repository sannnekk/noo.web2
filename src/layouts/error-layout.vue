<template>
  <div class="error-layout">
    <header class="error-layout__header container">
      <router-link
        class="error-layout__header__logo"
        :to="{ name: 'root' }"
      >
        <b>НОО.</b>Платформа
      </router-link>
      <div class="error-layout__header__widgets">
        <noo-theme-toggle-widget />
        <noo-help-widget />
      </div>
    </header>
    <main class="error-layout__content container">
      <slot />
    </main>
    <footer class="error-layout__footer container">
      <noo-footer />
    </footer>
  </div>
</template>

<style lang="sass" scoped>
// A dead end deserves a room of its own: no navigation to speak of, just the
// way back to the platform and the message itself, centred.
.error-layout
  display: flex
  flex-direction: column
  min-height: 100vh
  min-height: 100dvh
  background-color: var(--light-background-color)

  &__header
    display: flex
    flex-wrap: wrap
    align-items: center
    justify-content: space-between
    gap: var(--space-2xs) var(--space-s)
    padding-block: var(--space-s)

    &__logo
      font-size: fluid(1.1rem, 1.75rem)
      color: var(--form-text-color)
      text-decoration: none
      white-space: nowrap

      &:hover
        color: var(--lila)

    &__widgets
      display: flex
      flex-wrap: wrap
      align-items: center
      gap: var(--space-3xs)

  &__content
    flex: 1 1 auto
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    padding-block: var(--space-s) var(--space-l)

  &__footer
    margin-top: auto
</style>
