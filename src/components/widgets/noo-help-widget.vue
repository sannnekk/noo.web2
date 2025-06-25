<template>
  <div class="noo-help-widget">
    <router-link
      :to="{
        name: 'help.home'
      }"
      target="_blank"
      class="noo-help-widget__button"
      title="Помощь и поддержка"
    >
      <noo-icon
        name="help"
        class="noo-help-widget__button__icon"
      />
      <span class="noo-help-widget__button__text"> Помощь </span>
    </router-link>
  </div>
</template>

<style scoped lang="sass">
.noo-help-widget
  position: relative

  &__button
    text-decoration: none
    color: var(--form-text-color)
    display: flex
    justify-content: center
    gap: 0.3em
    align-items: center
    border-radius: 0.5em
    background-color: transparent
    cursor: pointer
    border: none
    border-radius: 50px
    background-color: var(--light-background-color)
    padding: 0.4em
    color: var(--text-light)

    &:hover
      background-color: var(--light)
      color: var(--form-text-color)

    @media screen and (max-width: 768px)
      padding: 0.3em

    &__icon
      font-size: 1.6em

      @media screen and (max-width: 768px)
        font-size: 1rem

    &__text
      font-size: 14px
      padding-right: 0.4em
      color: inherit
</style>
