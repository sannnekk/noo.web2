<template>
  <div class="account-settings-view">
    <noo-section
      title="Личная информация"
      description="Эти данные видны только Вам и преподавателям. Они нужны нам для связи с Вами, поэтому важно, чтобы они были актуальными."
    >
      <div
        v-if="isInitialLoading"
        class="account-settings-view__loading"
      >
        <noo-loader-icon contrast />
      </div>
      <noo-error-block
        v-else-if="loadError"
        no-margin
        :try-again="() => store.init()"
      >
        Не удалось загрузить данные аккаунта.
      </noo-error-block>
      <template v-else-if="store.draft">
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
            <noo-text-input
              v-model="name"
              label="Имя и фамилия"
              :validators="[validateName]"
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="2"
            :row="1"
            horizontal-align="stretch"
            vertical-align="top"
          >
            <noo-text-input
              :model-value="store.draft.username"
              label="Никнейм"
              readonly
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="1"
            :row="2"
            vertical-align="top"
            horizontal-align="stretch"
          >
            <noo-date-input
              :model-value="registrationDate"
              label="Дата регистрации"
              readonly
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="2"
            :row="2"
            vertical-align="top"
            horizontal-align="stretch"
          >
            <noo-text-input
              :model-value="store.draft.email ?? ''"
              label="Email"
              type="email"
              readonly
            />
          </noo-grid-layout-item>
        </noo-grid-layout>
        <div class="account-settings-view__actions">
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

    <noo-section
      title="Безопасность"
      description="Для смены пароля мы отправим Вам письмо со ссылкой, на которой Вы сможете задать новый пароль."
    >
      <noo-button
        variant="secondary"
        size="medium"
        :is-loading="store.requestPasswordChange.isLoading"
        :disabled="!hasEmail"
        @click="store.requestPasswordChange.execute()"
      >
        Сменить пароль
      </noo-button>
    </noo-section>

    <noo-section
      title="Активные сессии"
      description="Здесь отображаются все устройства, на которых Вы вошли в аккаунт. Если Вы заметили незнакомое устройство, рекомендуем завершить все сессии и сменить пароль."
    >
      <div
        v-if="store.sessions.isLoading && !store.sessions.data"
        class="account-settings-view__loading"
      >
        <noo-loader-icon contrast />
      </div>
      <noo-error-block
        v-else-if="!store.sessions.data && store.sessions.error"
        no-margin
        :try-again="() => store.sessions.execute()"
      >
        Не удалось загрузить активные сессии.
      </noo-error-block>
      <template v-else-if="sessions.length">
        <noo-card-stack>
          <session-card
            v-for="session in sessions"
            :key="session.id"
            :session="session"
            :is-loading="
              store.terminateSession.isLoading &&
              terminatingSessionId === session.id
            "
            @delete="askTerminateSession(session.id)"
          />
        </noo-card-stack>
        <div
          v-if="sessions.length > 1"
          class="account-settings-view__actions"
        >
          <noo-button
            variant="danger-inline"
            size="medium"
            :is-loading="store.terminateAllSessions.isLoading"
            @click="modals.terminateAll = true"
          >
            Завершить все сессии
          </noo-button>
        </div>
      </template>
      <noo-text-block
        v-else
        dimmed
      >
        Активных сессий не найдено.
      </noo-text-block>
    </noo-section>

    <noo-section
      title="Удаление аккаунта"
      description="Удаление аккаунта приведёт к безвозвратной потере доступа ко всем курсам и работам, а также к удалению всех данных, связанных с аккаунтом. Вся личная информация, включая имя, email, telegram и номер телефона, будет удалена. Если Вы уверены в своём решении, пожалуйста, нажмите кнопку ниже."
    >
      <noo-button
        variant="danger-inline"
        size="medium"
        :is-loading="store.deleteAccount.isLoading"
        @click="modals.deleteAccount = true"
      >
        Удалить аккаунт
      </noo-button>
    </noo-section>
  </div>

  <noo-sure-modal
    v-model:is-open="modals.terminateSession"
    @confirm="confirmTerminateSession"
    @cancel="terminatingSessionId = null"
  >
    <template #title>
      <noo-title :size="2">Завершить сессию?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        На устройстве потребуется снова войти в аккаунт. Если Вы завершаете
        текущую сессию, Вас перенаправит на страницу входа.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Завершить</template>
  </noo-sure-modal>

  <noo-sure-modal
    v-model:is-open="modals.terminateAll"
    @confirm="store.terminateAllSessions.execute()"
  >
    <template #title>
      <noo-title :size="2">Завершить все сессии?</noo-title>
    </template>
    <template #content>
      <noo-warning-block>
        Вы выйдете из аккаунта на всех устройствах, включая текущее.
      </noo-warning-block>
      <noo-text-block dimmed>
        После этого потребуется снова войти в аккаунт.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Завершить все</template>
  </noo-sure-modal>

  <noo-sure-modal
    v-model:is-open="modals.deleteAccount"
    @confirm="store.deleteAccount.execute()"
  >
    <template #title>
      <noo-title :size="2">Удалить аккаунт?</noo-title>
    </template>
    <template #content>
      <noo-warning-block>Это действие нельзя отменить.</noo-warning-block>
      <noo-text-block dimmed>
        Все данные, связанные с аккаунтом, будут безвозвратно удалены.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Удалить</template>
  </noo-sure-modal>
</template>

<script lang="ts" setup>
import { isStringOfLength } from '@/core/validators/string.utils'
import { computed, onBeforeUnmount, onMounted, reactive, shallowRef } from 'vue'
import SessionCard from '../components/session-card.vue'
import { useAccountSettingsStore } from '../stores/account-settings.store'

const store = useAccountSettingsStore()

const modals = reactive({
  terminateSession: false,
  terminateAll: false,
  deleteAccount: false
})

const terminatingSessionId = shallowRef<string | null>(null)

const isInitialLoading = computed(
  () => !store.user.data && store.user.isLoading
)
const loadError = computed(() => !store.user.data && !!store.user.error)
const sessions = computed(() => store.sessions.data ?? [])
const hasEmail = computed(() => !!store.draft?.email)
const canSave = computed(() => store.hasUnsavedChanges && !store.save.isLoading)

const name = computed<string>({
  get: () => store.draft?.name ?? '',
  set: (value) => {
    if (store.draft) {
      store.draft.name = value
    }
  }
})

const registrationDate = computed<Date | undefined>(() =>
  store.user.data ? new Date(store.user.data.createdAt) : undefined
)

function validateName(value: string) {
  return isStringOfLength(value, 1, 200)
}

function askTerminateSession(sessionId: string): void {
  terminatingSessionId.value = sessionId
  modals.terminateSession = true
}

function confirmTerminateSession(): void {
  if (!terminatingSessionId.value) {
    return
  }

  store.terminateSession.execute(terminatingSessionId.value)
  terminatingSessionId.value = null
}

onMounted(() => {
  store.init()
})

onBeforeUnmount(() => {
  store.resetDraft()
})
</script>

<style lang="sass" scoped>
.account-settings-view
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
