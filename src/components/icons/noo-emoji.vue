<template>
  <span>{{ emoji }}</span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  name: string
}

const props = defineProps<Props>()

const emoji = computed(() => {
  return emojis.find((e) => e.name === props.name)?.emoji
})

const emojis = [
  { emoji: '👍', name: 'like', unicode: '1f44d', html: '&#128077;' },
  { emoji: '👎', name: 'dislike', unicode: '1f44e', html: '&#128078;' },
  { emoji: '❤️', name: 'heart', unicode: '2764', html: '&#10084;' },
  { emoji: '😂', name: 'laugh', unicode: '1f602', html: '&#128514;' },
  { emoji: '😢', name: 'sad', unicode: '1f622', html: '&#128546;' },
  { emoji: '🤯', name: 'mindblowing', unicode: '1f92f', html: '&#129327;' },
  { emoji: '😀', name: 'happy', unicode: '1f600', html: '&#128512;' },
  { emoji: '✅', name: 'check', unicode: '2705', html: '&#9989;' },
  { emoji: '🤔', name: 'thinking', unicode: '1f914', html: '&#129300;' }
]
</script>
