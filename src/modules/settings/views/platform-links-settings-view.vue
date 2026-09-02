<template>
  <div class="platform-links-settings-view">
    <noo-section
      title="Ссылки и контакты"
      description="Куда платформа отправляет посетителей: сайт школы, документы и поддержка. Значения видны всем, включая тех, кто ещё не вошёл."
    >
      <div
        v-if="isInitialLoading"
        class="platform-links-settings-view__loading"
      >
        <noo-loader-icon />
      </div>
      <noo-error-block
        v-else-if="loadError"
        :try-again="() => store.reload()"
      >
        <noo-title :size="4">Не удалось загрузить настройки</noo-title>
      </noo-error-block>
      <div
        v-else-if="store.draft"
        class="platform-links-settings-view__form"
      >
        <noo-text-input
          v-model="store.draft.shopLink"
          label="Сайт школы"
          placeholder="https://no-os.ru"
          :validators="[validateUrl]"
        />
        <noo-text-input
          v-model="store.draft.privacyPolicyLink"
          label="Политика конфиденциальности"
          placeholder="https://no-os.ru/confidentiality"
          :validators="[validateUrl]"
        />
        <noo-text-input
          v-model="store.draft.termsLink"
          label="Договор публичной оферты"
          placeholder="https://no-os.ru/oferta"
          :validators="[validateUrl]"
        />
        <noo-text-input
          v-model="store.draft.supportChatLink"
          label="Ссылка на чат поддержки"
          placeholder="https://t.me/..."
          :validators="[validateUrl]"
        />
        <noo-text-input
          v-model="store.draft.supportChatName"
          label="Название чата поддержки"
          placeholder="@noo_support_chat"
          :validators="[(value) => isStringOfLength(value, 1, 255)]"
        />
        <noo-text-input
          v-model="store.draft.supportEmail"
          label="Почта поддержки"
          placeholder="noohelp@mail.ru"
          :validators="[validateEmail]"
        />
        <noo-text-input
          v-model="store.draft.supportResponseTime"
          label="Время ответа"
          placeholder="Обычно отвечаем в течение дня"
          :validators="[(value) => isStringOfLength(value, 1, 255)]"
        />
        <noo-text-block
          size="small"
          dimmed
          no-margin
        >
          Время ответа показывается в блоке «Не нашли ответ?» на странице
          помощи.
        </noo-text-block>

        <div class="platform-links-settings-view__actions">
          <noo-button
            variant="primary"
            :is-loading="store.save.isLoading"
            :disabled="!canSave"
            @click="store.save.execute()"
          >
            Сохранить
          </noo-button>
          <noo-button
            variant="secondary"
            :disabled="!store.hasUnsavedChanges || store.save.isLoading"
            @click="store.resetDraft()"
          >
            Отменить изменения
          </noo-button>
        </div>
      </div>
    </noo-section>
  </div>
</template>

<script lang="ts" setup>
import type { PlatformSettings } from '@/core/api/endpoints/platform-settings.types'
import { usePlatformSettingsStore } from '@/core/stores/platform-settings.store'
import { isStringOfLength } from '@/core/validators/string.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed, onBeforeUnmount, onMounted } from 'vue'

const store = usePlatformSettingsStore()

const isInitialLoading = computed(
  () => !store.request.data && store.request.isLoading
)
const loadError = computed(() =>
  store.request.data ? null : store.request.error
)

const canSave = computed(
  () =>
    !!store.draft &&
    store.hasUnsavedChanges &&
    !store.save.isLoading &&
    isEveryFieldValid(store.draft)
)

function isEveryFieldValid(draft: PlatformSettings): boolean {
  return (
    validateUrl(draft.shopLink) === true &&
    validateUrl(draft.privacyPolicyLink) === true &&
    validateUrl(draft.termsLink) === true &&
    validateUrl(draft.supportChatLink) === true &&
    validateEmail(draft.supportEmail) === true &&
    isStringOfLength(draft.supportChatName, 1, 255) === true &&
    isStringOfLength(draft.supportResponseTime, 1, 255) === true
  )
}

/**
 * Matches what the API accepts, so a bad value is caught here rather than coming
 * back as a 400 after the save.
 */
function validateUrl(value: string): true | ValidationError[] {
  try {
    const url = new URL(value)

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return true
    }
  } catch {
    // Falls through to the error below.
  }

  return [
    { kind: 'error', message: 'Введите полную ссылку, начиная с https://' }
  ]
}

function validateEmail(value: string): true | ValidationError[] {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return true
  }

  return [{ kind: 'error', message: 'Введите корректный адрес почты' }]
}

onMounted(() => {
  // Loaded at app start already; this covers a hard reload straight onto the
  // page while that request is still out, and reloads after a failed one.
  store.load()
})

// The draft is shared with everything reading the settings, so an abandoned
// edit must not be left behind on it.
onBeforeUnmount(() => {
  store.resetDraft()
})
</script>

<style lang="sass" scoped>
.platform-links-settings-view
  display: flex
  flex-direction: column
  gap: 2em

  &__loading
    display: flex
    justify-content: center
    padding: 2em 0

  &__form
    display: flex
    flex-direction: column
    gap: 1em
    max-width: 40rem

  &__actions
    display: flex
    flex-wrap: wrap
    gap: 0.75em
    margin-top: 1em
</style>
