<template>
  <div
    class="noo-under-construction-block"
    :class="{
      'noo-under-construction-block--centered': centered,
      'noo-under-construction-block--with-image': withImage,
      'noo-under-construction-block--no-margin': noMargin
    }"
  >
    <div
      v-if="withImage"
      class="noo-under-construction-block__image"
    >
      <img
        src="@/assets/under-construction.svg"
        alt="Ведутся технические работы"
      />
    </div>
    <div class="noo-under-construction-block__content">
      <div
        v-if="!withImage"
        class="noo-under-construction-block__icon"
      >
        <noo-icon name="settings" />
      </div>
      <div class="noo-under-construction-block__text">
        <noo-title
          :size="3"
          no-margin
        >
          {{ title }}
        </noo-title>
        <noo-text-block no-margin>
          <slot>Мы еще работаем над ним. Загляните сюда позже</slot>
        </noo-text-block>
      </div>
    </div>
    <div class="noo-under-construction-block__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  /** Heading of the block. The default slot carries the text below it. */
  title?: string
  /** Show the illustration instead of the inline gear icon. */
  withImage?: boolean
  centered?: boolean
  noMargin?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Раздел в разработке'
})
</script>

<style scoped lang="sass">
// Deliberately untinted, unlike its neighbours `noo-error-block` and
// `noo-warning-block`: nothing went wrong here, so the state is announced by
// the illustration rather than by an alarm colour.
.noo-under-construction-block
  display: flex
  align-items: center
  flex-direction: column
  gap: var(--space-2xs)
  padding: 1em
  width: min(100%, 600px)

  &--no-margin
    padding: 0

  &--centered
    justify-content: center
    text-align: center

  &--with-image
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

    // With the illustration above it, the text is the caption of a centred
    // composition rather than a column next to an icon.
    .noo-under-construction-block--with-image &
      padding-left: 0

  &__actions
    display: flex
    flex-wrap: wrap
    flex-direction: row
    gap: 0.5em

  :deep() ul
    padding-left: 1.5em
    margin: 0.2em 0
    line-height: 1.1em
</style>
