<template>
  <router-link
    v-if="to && !isNewTab"
    :to="to"
    class="noo-inline-link"
    :class="`noo-inline-link--${size}`"
  >
    <slot />
  </router-link>
  <a
    v-else
    :href="computedHref"
    :target="isNewTab ? '_blank' : undefined"
    :rel="isNewTab ? 'noopener noreferrer' : undefined"
    class="noo-inline-link"
    :class="`noo-inline-link--${size}`"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import type { RouteLocationAsRelativeGeneric } from 'vue-router'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  to?: string | RouteLocationAsRelativeGeneric
  href?: string
  newTab?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), { size: 'medium' })
const router = useRouter()

const isNewTab = computed(() => props.newTab || props.href?.startsWith('http'))

const computedHref = computed(() => {
  if (props.href) {
    return props.href
  }
  if (props.to && isNewTab.value) {
    const resolved = router.resolve(props.to)

    return resolved.href
  }

  return undefined
})
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

  &--small
    font-size: 0.8em

  &--medium
    font-size: 1em

  &--large
    font-size: 1.2em
</style>
