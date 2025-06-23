<template>
  <component
    :is="component"
    :to="to"
    class="noo-button"
    :class="{
      'noo-button--primary': variant === 'primary',
      'noo-button--secondary': variant === 'secondary',
      'noo-button--tertiary': variant === 'tertiary',
      'noo-button--danger': variant === 'danger',
      'noo-button--inline': variant === 'inline',
      'noo-button--loading': isLoading,
      'noo-button--disabled': disabled,
      'noo-button--small': size === 'small',
      'noo-button--medium': size === 'medium',
      'noo-button--large': size === 'large',
      'noo-button--dark': mode === 'dark'
    }"
    :href="to"
    :target="newTab ? '_blank' : undefined"
    :disabled="disabled || isLoading"
  >
    <noo-loader-icon
      v-if="isLoading"
      class="noo-button__loading"
      :contrast="variant === 'primary'"
    />
    <span><slot /></span>
  </component>
</template>

<script setup lang="ts">
import { useTheme } from '@/core/composables/useTheme'
import { computed } from 'vue'
import type { RouteLocationAsRelativeGeneric } from 'vue-router'

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'inline'
export type ButtonSize = 'small' | 'medium' | 'large'

interface Props {
  isLoading?: boolean
  variant?: ButtonType
  size?: ButtonSize
  to?: RouteLocationAsRelativeGeneric | string
  newTab?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  isLoading: false,
  variant: 'primary',
  size: 'medium',
  to: undefined,
  newTab: false,
  disabled: false
})

const component = computed(() =>
  props.to
    ? typeof props.to === 'string' && props.to.startsWith('http')
      ? 'a'
      : 'router-link'
    : 'button'
)

const {mode} = useTheme()
</script>

<style scoped lang="sass">
.noo-button
  text-decoration: none
  display: block
  text-transform: uppercase
  cursor: pointer
  user-select: none
  font-weight: 500
  text-align: center
  border: var(--form-text-color) solid 1px
  border-radius: 30px
  letter-spacing: 0.05em

  &--small
    font-size: 0.7em
    padding: 0.4em 0.9em

  &--medium
    font-size: 0.8em
    padding: 0.5em 2em

    &.noo-button--secondary
      text-transform: none

  &--large
    font-size: 1em
    padding: 0.5em 3em

  &--primary
    background-color: var(--primary)
    color: var(--black)
    border-color: var(--black)

    &:hover
      background-color: var(--lightest)
      color: var(--form-text-color)

  &--secondary
    background-color: var(--form-background)
    color: var(--form-text-color)

    &:hover
      background-color: var(--form-text-color)
      color: var(--lightest)

  &--tertiary
    background-color: var(--light-background-color)
    color: var(--form-text-color)
    border-color: var(--light-background-color)
    text-transform: none

    &:hover
      background-color: var(--border-color)

  &--danger
    background-color: var(--danger)
    color: var(--white)
    border-color: var(--danger)

    &:hover
      background-color: var(--lightest)
      color: var(--danger)

  &--inline
    background-color: transparent
    color: var(--lila)
    border: none

    &:hover
      background-color: transparent
      color: var(--text-light)

  &--disabled
    cursor: not-allowed
    background-color: var(--border-color) !important
    color: var(--white)
    border-color: transparent

  &__loading
    font-size: 1.25em
    position: relative
    top: 0.1em
</style>
