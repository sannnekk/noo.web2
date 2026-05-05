<template>
  <div class="noo-section">
    <div class="noo-section__header">
      <noo-title :size="size ?? 3">
        {{ title }}
      </noo-title>
      <noo-text-block
        v-if="description"
        dimmed
        size="small"
        no-margin
      >
        {{ description }}
      </noo-text-block>
    </div>
    <div class="noo-section__content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  title: string
  description?: string
  size?: number
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.noo-section
  &__header
    margin-bottom: 1em
</style>
