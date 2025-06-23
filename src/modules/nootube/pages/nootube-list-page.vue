<template>
  <div class="nootube-list-page">
    <noo-tabs-layout
      use-route-tabs
      route-param-name="tabId"
    >
      <template #tab-title-all>
        <span>Все видео</span>
      </template>
      <template #tab-all>
        <nootube-list-view
          v-model:page="allSearch.page.value"
          v-model:search="allSearch.search.value"
          :items="videos /* allSearch.data.value */"
          :total-count="allSearch.total.value"
          :is-loading="allSearch.isLoading.value"
          :limit="allSearch.pageSize.value"
        />
      </template>
      <template #tab-title-favourites>
        <span>Избранное</span>
      </template>
      <template #tab-favourites>
        <nootube-list-view
          v-model:page="favouritesSearch.page.value"
          v-model:search="favouritesSearch.search.value"
          :items="favouritesSearch.data.value"
          :total-count="favouritesSearch.total.value"
          :is-loading="favouritesSearch.isLoading.value"
          :limit="favouritesSearch.pageSize.value"
        />
      </template>
    </noo-tabs-layout>
  </div>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { NooTubeService } from '../api/nootube.service'
import { videos } from '../mock-data/videos'
import type { NooTubeListPageTab } from '../types'
import nootubeListView from '../views/nootube-list-view.vue'

export interface NooTubeListPageProps {
  tab: NooTubeListPageTab
}

const allSearch = useSearch(NooTubeService.get)
const favouritesSearch = useSearch(NooTubeService.getFavourites)
</script>

<style scoped></style>
