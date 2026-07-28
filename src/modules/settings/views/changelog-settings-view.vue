<template>
  <div class="changelog-settings-view">
    <noo-section title="Версия платформы">
      <noo-text-block dimmed>
        Текущая версия приложения:
        <strong>{{ store.frontendVersion ?? '—' }}</strong>
        · Текущая версия API:
        <strong>{{ store.apiVersion ?? '—' }}</strong>
      </noo-text-block>
    </noo-section>

    <noo-section
      title="История изменений"
      description="Список изменений собирается автоматически из истории коммитов при выпуске каждой версии."
    >
      <noo-tabs-layout>
        <template #tab-title-frontend> Приложение </template>
        <template #tab-frontend>
          <changelog-release-list
            :releases="store.frontend.data ?? []"
            :is-loading="store.frontend.isLoading"
            :error="store.frontend.error"
            :try-again="() => store.frontend.execute()"
          />
        </template>

        <template #tab-title-api> API </template>
        <template #tab-api>
          <changelog-release-list
            :releases="store.api.data ?? []"
            :is-loading="store.api.isLoading"
            :error="store.api.error"
            :try-again="() => store.api.execute()"
          />
        </template>
      </noo-tabs-layout>
    </noo-section>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import ChangelogReleaseList from '../components/changelog-release-list.vue'
import { useChangelogSettingsStore } from '../stores/changelog-settings.store'

const store = useChangelogSettingsStore()

onMounted(() => {
  store.init()
})
</script>

<style lang="sass" scoped>
.changelog-settings-view
  display: flex
  flex-direction: column
  gap: 2em
</style>
