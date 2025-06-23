<template>
  <span
    class="pane-toggler"
    @click="model = !model"
    @mouseenter="isOnHover = true"
    @mouseleave="isOnHover = false"
  >
    <noo-icon
      name="bars"
      :animation="isOnHover"
    />
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const model = defineModel<boolean>('isOpen', {
  default: false
})

const isOnHover = ref(false)
</script>

<style scoped lang="sass">
.pane-toggler
  border: none
  background: none
  color: var(--dark)
  font-size: 1em
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer
  height: 1em
  width: 1em
</style>
