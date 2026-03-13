<template>
  <p
    :class="['noo-text-block', `noo-text-block--${size}`]"
    :style="{
      textAlign: align,
      color: color
        ? `var(--${color})`
        : dimmed
          ? 'var(--text-light)'
          : 'inherit',
      display: inline ? 'inline' : 'block',
      margin: noMargin ? '0.1em 0 0.1em 0' : undefined
    }"
  >
    <slot />
  </p>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  align?: 'left' | 'center' | 'right'
  dimmed?: boolean
  inline?: boolean
  noMargin?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-text-block
	&--small
		font-size: 14px
		line-height: 16px

	&--medium
		font-size: 16px
		line-height: 24px

	&--large
		font-size: 18px
		line-height: 26px
</style>
