<template>
  <div class="nootube-list-view">
    <noo-card-search-view
      v-model:page="page"
      v-model:search="search"
      :items="items"
      :total-count="totalCount"
      :limit="limit"
      :is-loading="isLoading"
      :per-row="4"
      gap="0.5em"
    >
      <template #actions>
        <noo-button> Загрузить видео </noo-button>
      </template>
      <template #tile="{ item }">
        <noo-video-card :video="item" />
      </template>
      <template #empty>
        <noo-not-found-image />
        <noo-title
          :size="4"
          align="center"
        >
          Ничего не найдено
        </noo-title>
        <noo-text-block
          align="center"
          size="medium"
          dimmed
        >
          Попробуйте изменить параметры поиска
        </noo-text-block>
      </template>
    </noo-card-search-view>
  </div>
</template>

<script setup lang="ts">
import type { NooTubeVideoEntity } from '../api/nootube.types'

interface Props {
  items: NooTubeVideoEntity[]
  totalCount: number
  isLoading?: boolean
  limit?: number
}

withDefaults(defineProps<Props>(), {
  limit: 25,
  isLoading: false
})

const page = defineModel<number>('page', {
  default: 1
})

const search = defineModel<string>('search', {
  default: ''
})
</script>

<style scoped lang="sass">
.nootube-list-view
  padding: 0 0
</style>
