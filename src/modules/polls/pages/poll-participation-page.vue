<template>
  <div class="poll-participation-page">
    <noo-swap-animation>
      <div
        v-if="isLoading"
        class="poll-participation-page__loading"
      >
        <noo-loader-icon
          class="poll-participation-page__loading__icon"
          contrast
        />
        <noo-text-block class="poll-participation-page__loading__text">
          Загрузка опроса...
        </noo-text-block>
      </div>
      <div
        v-else-if="participation"
        class="poll-participation-page__content"
      >
        Content
      </div>
      <noo-error-block
        v-else
        with-image
        centered
        :try-again="init"
      >
        <noo-title :size="3"> Не удалось загрузить опрос </noo-title>
      </noo-error-block>
    </noo-swap-animation>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Props {
  pollId: string
}

defineProps<Props>()

const isLoading = ref(true)
const participation = ref(null)

async function init() {}

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
    participation.value = 1
  }, 2000)
})
</script>

<style lang="sass" scoped>
.poll-participation-page
  &__loading
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 500px
    width: 100%

    &__icon
      font-size: 3rem

    &__text
      font-size: 1.2rem
</style>
