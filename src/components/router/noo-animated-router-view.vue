<template>
  <router-view v-slot="{ Component }">
    <transition
      enter-active-class="animate__animated animate__fadeInLeft animate__faster"
      leave-active-class="animate__animated animate__fadeOutRight animate__faster"
      mode="out-in"
    >
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped lang="sass">
:deep(.animate__animated)
  --animate-duration: 0.1s
  animation-timing-function: ease-in-out
</style>
