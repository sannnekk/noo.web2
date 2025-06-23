<template>
  <component
    :is="to ? 'router-link' : 'a'"
    :to="to"
    :href="to ? undefined : href"
    :target="href && href.startsWith('http') ? '_blank' : undefined"
    :rel="href && href.startsWith('http') ? 'noopener noreferrer' : undefined"
    class="noo-inline-link"
    @click.stop
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationAsRelativeGeneric } from 'vue-router'

interface Props {
  to?: string | RouteLocationAsRelativeGeneric
  href?: string
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-inline-link
	display: inline-block
	text-decoration: none
	color: var(--lila)
	font-weight: 500
	font-size: 1em
	line-height: 1.5em

	&:hover
		text-decoration: underline
		cursor: pointer
</style>
