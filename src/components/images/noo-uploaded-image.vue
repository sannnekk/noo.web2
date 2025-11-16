<template>
  <img
    :src="link"
    @error="onLoadFailed()"
  />
</template>

<script setup lang="ts">
import { appConfig } from '@/core/config/app.config'
import type { MediaEntity } from '@/modules/media/api/media.types'
import { ref, watchEffect } from 'vue'

interface Props {
  src?: string | File | MediaEntity | undefined | null
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

  // TODO: replace with Utils.isEntity(name) function
  if (
    props.src &&
    '_entityName' in props.src &&
    props.src._entityName === 'Media'
  ) {
    const media = props.src as MediaEntity

    link.value = `${media.path}/${media.name}.${media.extension}`

    return
  }

  link.value = '/img/placeholder.svg'
})

function onLoadFailed() {
  link.value = '/img/placeholder.svg'
}
</script>
