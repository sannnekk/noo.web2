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
        :try-again="() => accountSettingsStore.init()"
      >
        Не удалось загрузить данные аккаунта.
      </noo-error-block>
      <template v-else-if="accountSettingsStore.draft">
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
              v-model="accountSettingsStore.draft.name"
              label="Имя и фамилия"
              :errors="validationState.fieldErrors.name"
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="2"
            :row="1"
            horizontal-align="stretch"
            vertical-align="top"
          >
            <noo-text-input
              v-model="accountSettingsStore.draft.username"
              label="Никнейм"
              :errors="validationState.fieldErrors.username"
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="1"
            :row="2"
            vertical-align="top"
            horizontal-align="stretch"
          >
            <noo-phone-input
              v-model="accountSettingsStore.draft.phone"
              v-model:is-valid="phoneValidity"
              label="Номер телефона"
            />
          </noo-grid-layout-item>
          <noo-grid-layout-item
            :col="2"
            :row="2"
            vertical-align="top"
            horizontal-align="stretch"
          >
            <noo-text-input
              v-model="accountSettingsStore.draft.email"
              label="Email"
              type="email"
              :errors="validationState.fieldErrors.email"
            />
            <noo-text-block
              size="small"
              dimmed
              no-margin
            >
              Если Вы измените email, то для подтверждения новой почты Вам нужно
              будет перейти по ссылке в письме, которое мы отправим на новый
              адрес
            </noo-text-block>
          </noo-grid-layout-item>
        </noo-grid-layout>
        <noo-form-errors :errors="validationState.rootErrors" />
        <div class="account-settings-view__actions">
          <noo-button
            variant="primary"
            size="medium"
            :is-loading="accountSettingsStore.save.isLoading"
            :disabled="!canSave"
            @click="accountSettingsStore.save.execute()"
          >
            Сохранить изменения
          </noo-button>
          <noo-button
            v-if="accountSettingsStore.hasUnsavedChanges"
            variant="inline"
            size="medium"
            :disabled="accountSettingsStore.save.isLoading"
            @click="accountSettingsStore.resetDraft()"
          >
            Отменить
          </noo-button>
        </div>
      </template>
    </noo-section>

    <noo-section
      title="Смена пароля"
      description="Для смены пароля мы отправим Вам письмо со ссылкой, через которую Вы сможете создать новый пароль."
    >
      <noo-button
        variant="secondary"
        size="medium"
        :is-loading="accountSettingsStore.requestPasswordChange.isLoading"
        @click="accountSettingsStore.requestPasswordChange.execute()"
      >
        Сменить пароль
      </noo-button>
    </noo-section>

    <noo-section
      title="Активные сессии"
      description="Здесь отображаются все устройства, на которых Вы вошли в аккаунт. Если Вы заметили незнакомое устройство, рекомендуем завершить все сессии и сменить пароль."
    >
      <div
        v-if="
          accountSettingsStore.sessions.isLoading &&
          !accountSettingsStore.sessions.data
        "
        class="account-settings-view__loading"
      >
        <noo-loader-icon contrast />
      </div>
      <noo-error-block
        v-else-if="
          !accountSettingsStore.sessions.data &&
          accountSettingsStore.sessions.error
        "
        no-margin
        :try-again="() => accountSettingsStore.sessions.execute()"
      >
        Не удалось загрузить активные сессии.
      </noo-error-block>
      <template v-else-if="accountSettingsStore.sessions.data?.length">
        <noo-card-stack>
          <session-card
            v-for="session in accountSettingsStore.sessions.data"
            :key="session.id"
            :session="session"
            :is-loading="
              accountSettingsStore.terminateSession.isLoading &&
              terminatingSessionId === session.id
            "
            @delete="askTerminateSession(session.id)"
          />
        </noo-card-stack>
        <div
          v-if="accountSettingsStore.sessions.data?.length"
          class="account-settings-view__actions"
        >
          <noo-button
            variant="danger-inline"
            size="medium"
            :is-loading="accountSettingsStore.terminateAllSessions.isLoading"
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
        :is-loading="accountSettingsStore.deleteAccount.isLoading"
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
    @confirm="accountSettingsStore.terminateAllSessions.execute()"
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
    @confirm="accountSettingsStore.deleteAccount.execute(deletionPassword)"
  >
    <template #title>
      <noo-title :size="2">Удалить аккаунт?</noo-title>
    </template>
    <template #content>
      <noo-error-block>
        Это действие нельзя отменить. Все данные, связанные с аккаунтом, будут
        безвозвратно удалены.
      </noo-error-block>

      <noo-text-block
        dimmed
        size="small"
      >
      </noo-text-block>
      <noo-text-input
        v-model="deletionPassword"
        label="Введите Ваш пароль для подтверждения"
        type="password"
      />
    </template>
    <template #confirm-action-text>Удалить</template>
  </noo-sure-modal>
</template>

<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef
} from 'vue'
import { storeToRefs } from 'pinia'
import SessionCard from '../components/session-card.vue'
import { useAccountSettingsStore } from '../stores/account-settings.store'
import { AccountSettingsDraftSchema } from '../schemas'
import { useEntityValidation } from '@/core/composables/useEntityValidation'
import { validateWithZod } from '@/core/validators/zod-validation.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'

const accountSettingsStore = useAccountSettingsStore()
const { draft } = storeToRefs(accountSettingsStore)

const { validationState } = useEntityValidation(draft, (value) =>
  validateWithZod(AccountSettingsDraftSchema, value)
)

const phoneValidity = ref<true | ValidationError[]>(true)
const isPhoneValid = computed(() => phoneValidity.value === true)

const modals = reactive({
  terminateSession: false,
  terminateAll: false,
  deleteAccount: false
})

const terminatingSessionId = shallowRef<string | null>(null)

const isInitialLoading = computed(
  () => !accountSettingsStore.user.data && accountSettingsStore.user.isLoading
)
const loadError = computed(
  () => !accountSettingsStore.user.data && !!accountSettingsStore.user.error
)
const canSave = computed(
  () =>
    accountSettingsStore.hasUnsavedChanges &&
    !accountSettingsStore.save.isLoading &&
    validationState.value.isValid &&
    isPhoneValid.value
)
const deletionPassword = shallowRef('')

function askTerminateSession(sessionId: string): void {
  terminatingSessionId.value = sessionId
  modals.terminateSession = true
}

function confirmTerminateSession(): void {
  if (!terminatingSessionId.value) {
    return
  }

  accountSettingsStore.terminateSession.execute(terminatingSessionId.value)
  terminatingSessionId.value = null
}

onMounted(() => {
  accountSettingsStore.init()
})

onBeforeUnmount(() => {
  accountSettingsStore.resetDraft()
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
