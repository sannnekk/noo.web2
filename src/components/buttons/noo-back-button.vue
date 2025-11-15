<template>
  <router-link
    class="noo-back-button"
    :to="route ?? '#'"
  >
    &#8249; <slot />
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationAsRelativeGeneric } from 'vue-router'

interface Props {
  route?: RouteLocationAsRelativeGeneric
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-back-button
	display: block
	margin-bottom: 1rem
	font-size: 0.8em
	color: var(--text-light)
	text-decoration: none

	&:hover
		color: var(--secondary)
</style>
