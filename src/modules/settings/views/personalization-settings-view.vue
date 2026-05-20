<template>
  <div class="personalization-settings-view">
    <noo-section
      title="Настройки темы"
      description="Здесь Вы можете настроить внешний вид платформы под себя. Выберите светлую или тёмную тему, настройте картинку на фон fs. Ваши настройки будут сохранены и применены при каждом входе в систему"
    >
      <noo-grid-layout
        :cols="1"
        gap="0.5em"
      >
        <noo-grid-layout-item
          :col="1"
          :row="1"
        >
          <noo-text-block
            dimmed
            size="small"
          >
            Сейчас выбрана тема:
            <strong>{{ mode === 'dark' ? 'тёмная' : 'светлая' }}</strong
            >, сменить:
            <noo-theme-toggle-widget with-name />
          </noo-text-block>
        </noo-grid-layout-item>
        <noo-grid-layout-item
          :col="1"
          :row="2"
          horizontal-align="stretch"
        >
          <noo-file-uploader
            v-model="backgroundImage"
            label="Загрузить картинку на фон"
            :types="['image']"
            :max-count="1"
            category="profile-background"
          />
        </noo-grid-layout-item>
      </noo-grid-layout>
    </noo-section>
    <noo-section
      title="Настройки шрифтов"
      description="Здесь Вы можете настроить размер шрифта на платформе. Он будет применен при просмотре курса и при решении работы"
    >
      TODO: настройки шрифтов
    </noo-section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useTheme } from '@/core/composables/useTheme.ts'
import type { MediaEntity } from '@/modules/media/api/media.types'

const { mode } = useTheme()

const backgroundImage = ref<MediaEntity[]>([])
</script>
