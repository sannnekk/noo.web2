<template>
  <img
    :src="link"
    @error="onLoadFailed()"
  >
</template>

<script setup lang="ts">
import { appConfig } from '@/core/config/app.config'
import { ref, watchEffect } from 'vue'

interface Props {
  src?: string | File | undefined
}

const props = defineProps<Props>()

const link = ref('')

watchEffect(() => {
  if (typeof props.src === 'string' && props.src.startsWith('http')) {
    link.value = props.src

    return
  }

  if (typeof props.src === 'string' && props.src.startsWith('data:')) {
    link.value = props.src

    return
  }

  if (typeof props.src === 'string') {
    link.value = `${appConfig.cdnUrl}/${props.src}`

    return
  }

  if (props.src instanceof File) {
    link.value = URL.createObjectURL(props.src)

    return
  }

  link.value = '/img/placeholder.svg'
})

function onLoadFailed() {
  link.value = '/img/placeholder.svg'
}
</script>
