<template>
  <div class="personalization-settings-view">
    <noo-section
      title="Настройки темы"
      description="Здесь Вы можете настроить внешний вид платформы под себя. Выберите светлую или тёмную тему или используйте системную. Настройте картинку на фон. Ваши настройки будут сохранены и применены при каждом входе в систему."
    >
      <div
        v-if="isInitialLoading"
        class="personalization-settings-view__loading"
      >
        <noo-loader-icon contrast />
      </div>
      <noo-error-block
        v-else-if="loadError"
        no-margin
        :try-again="() => store.init()"
      >
        Не удалось загрузить настройки персонализации.
      </noo-error-block>
      <template v-else>
        <noo-grid-layout
          :cols="2"
          gap="0.5em"
        >
          <noo-grid-layout-item
            :col="1"
            :row="1"
            horizontal-align="stretch"
            vertical-align="top"
          >
            <noo-select-input
              v-model="store.draft.theme"
              label="Тема оформления"
              :options="userThemeOptions"
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="2"
            :row="1"
            horizontal-align="stretch"
            vertical-align="top"
          >
            <noo-select-input
              v-model="store.draft.fontSize"
              label="Размер шрифта"
              :options="fontSizeOptions"
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="1"
            :row="2"
            :colspan="2"
            horizontal-align="stretch"
          >
            <noo-file-uploader
              v-model="backgroundImage"
              label="Загрузить картинку на фон"
              :types="['image']"
              :max-count="1"
              category="profile-background"
            />
            TODO: add backgroundImage: MediaEntity to UserSettingsEntity
          </noo-grid-layout-item>
        </noo-grid-layout>
        <div class="personalization-settings-view__actions">
          <noo-button
            variant="primary"
            size="medium"
            :is-loading="store.save.isLoading"
            :disabled="!canSave"
            @click="store.save.execute()"
          >
            Сохранить изменения
          </noo-button>
          <noo-button
            v-if="store.hasUnsavedChanges"
            variant="inline"
            size="medium"
            :disabled="store.save.isLoading"
            @click="store.resetDraft()"
          >
            Отменить
          </noo-button>
        </div>
      </template>
    </noo-section>
    <noo-section title="Предпросмот текста">
      TODO: Предпросмотр текста
    </noo-section>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme, type Theme } from '@/core/composables/useTheme'
import type { MediaEntity } from '@/modules/media/api/media.types'
import { fontSizeOptions, userThemeOptions } from '../constants'
import { usePersonalizationSettingsStore } from '../stores/personalization-settings.store'

const store = usePersonalizationSettingsStore()
const { setTheme } = useTheme()

const backgroundImage = ref<MediaEntity[]>([])

const isInitialLoading = computed(
  () => !store.settings.data && store.settings.isLoading
)
const loadError = computed(() => !store.settings.data && !!store.settings.error)
const canSave = computed(() => store.hasUnsavedChanges && !store.save.isLoading)

function resolveSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

watch(
  () => store.draft.theme,
  (theme) => {
    if (!theme) {
      return
    }

    setTheme(theme === 'system-default' ? resolveSystemTheme() : theme)
  }
)

onMounted(() => {
  store.init()
})

onBeforeUnmount(() => {
  store.resetDraft()
})
</script>

<style lang="sass" scoped>
.personalization-settings-view
  display: flex
  flex-direction: column
  gap: 2em

  &__loading
    display: flex
    justify-content: center
    font-size: 2em

  &__actions
    display: flex
    flex-wrap: wrap
    gap: 0.75em
    margin-top: 1em
</style>
