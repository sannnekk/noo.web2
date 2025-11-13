<template>
  <div
    class="noo-error-block"
    :class="{
      'noo-error-block--centered': centered,
      'noo-error-block__with-image': withImage
    }"
  >
    <div
      v-if="withImage"
      class="noo-error-block__image"
    >
      <img
        src="@/assets/error.svg"
        alt="Error"
      />
    </div>
    <div class="noo-error-block__content">
      <div
        v-if="!withImage"
        class="noo-error-block__icon"
      >
        <noo-icon name="cross-red" />
      </div>
      <div class="noo-error-block__text">
        <slot />
      </div>
    </div>
    <div class="noo-error-block__actions">
      <noo-button
        v-if="tryAgain"
        variant="secondary"
        @click="tryAgain()"
      >
        Попробовать еще раз
      </noo-button>
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  withImage?: boolean
  tryAgain?: () => unknown
  centered?: boolean
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-error-block
  display: flex
  align-items: center
  flex-direction: column
  padding: 1em
  border-radius: var(--border-radius)
  background-color: var(--lightest)
  color: var(--danger)
  width: min(100%, 600px)

  &--centered
    justify-content: center
    text-align: center

  &__with-image
    margin: 0 auto
    padding: 3em 0

  &__image
    width: min(500px, 80%)

    img
      width: 100%
      height: auto

  &__content
    display: flex
    align-items: center

  &__icon
    font-size: 40px
    line-height: 10px

  &__text
    padding-left: 1em

  &__actions
    display: flex
    flex-wrap: wrap
    flex-direction: row
    gap: 0.5em
</style>
