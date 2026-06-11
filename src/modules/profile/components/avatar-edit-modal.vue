<template>
  <noo-base-modal
    v-model:is-open="openModel"
    :close-on-outside-click="!isSaving"
    :close-on-esc="!isSaving"
  >
    <template #title>
      <noo-title :size="2"> Изменить аватар </noo-title>
    </template>
    <template #content>
      <div class="avatar-edit-modal">
        <div class="avatar-edit-modal__preview">
          <noo-user-avatar
            :name="name"
            :avatar="avatarModel"
          />
        </div>

        <noo-file-uploader
          v-model="uploadedMedia"
          label="Загрузить новый аватар"
          :types="['image']"
          :max-count="1"
          crop
          :crop-ratio="1"
          category="user-avatar"
        />

        <noo-text-block
          size="small"
          dimmed
          no-margin
        >
          Или используйте фотографию из вашего профиля Telegram. <br />
          Для этого Ваш аватар в Telegram должен быть виден всем, не только
          контактам
        </noo-text-block>
        <noo-telegram-login-button />
      </div>
    </template>
    <template #actions="{ close }">
      <noo-button
        v-if="hasAvatar"
        variant="danger-inline"
        :is-loading="isSaving"
        @click="removeAvatar()"
      >
        Удалить аватар
      </noo-button>
      <noo-button
        variant="secondary"
        :disabled="isSaving"
        @click="close()"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import { isApiError } from '@/core/api/api.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { MediaService } from '@/modules/media/api/media.service'
import type { MediaEntity } from '@/modules/media/api/media.types'
import { UserService } from '@/modules/users/api/user.service'
import type { UserAvatarEntity } from '@/modules/users/api/user.types'
import { computed, ref } from 'vue'

interface Props {
  userId: string
  name?: string
}

const props = defineProps<Props>()

const openModel = defineModel<boolean>('isOpen', { default: false })
const avatarModel = defineModel<UserAvatarEntity | null>('avatar', {
  default: null
})

const globalUiStore = useGlobalUIStore()

const isSaving = ref(false)

const hasAvatar = computed(
  () => !!avatarModel.value && avatarModel.value.avatarType !== 'none'
)

// The uploader always shows an empty dropzone; the chosen image is persisted
// as the avatar and reflected in the preview above instead of as a file card.
const uploadedMedia = computed<MediaEntity[]>({
  get: () => [],
  set: (value) => {
    const media = value[0]

    if (media) {
      void setCustomAvatar(media)
    }
  }
})

async function setCustomAvatar(media: MediaEntity): Promise<void> {
  await persist(
    [
      { op: 'replace', path: '/avatarType', value: 'custom' },
      { op: 'replace', path: '/mediaId', value: media.id }
    ],
    buildAvatar({
      avatarType: 'custom',
      mediaId: media.id,
      media,
      avatarUrl: media.url
    }),
    'Аватар обновлён'
  )
}

async function removeAvatar(): Promise<void> {
  const previous = avatarModel.value

  await persist(
    [
      { op: 'replace', path: '/avatarType', value: 'none' },
      { op: 'replace', path: '/mediaId', value: null }
    ],
    buildAvatar({ avatarType: 'none', mediaId: null, media: null }),
    'Аватар удалён'
  )

  // Free the previously uploaded media if it is no longer referenced.
  if (previous?.avatarType === 'custom' && previous.mediaId) {
    void MediaService.delete(previous.mediaId)
  }
}

async function persist(
  patch: JsonPatchDocument<UserAvatarEntity>,
  optimistic: UserAvatarEntity,
  successMessage: string
): Promise<void> {
  isSaving.value = true

  const response = await UserService.updateAvatar(props.userId, patch)

  isSaving.value = false

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      'Не удалось обновить аватар',
      response.error
    )

    return
  }

  avatarModel.value = optimistic
  globalUiStore.createSuccessToast(successMessage)
}

function buildAvatar(partial: Partial<UserAvatarEntity>): UserAvatarEntity {
  const current = avatarModel.value

  return {
    _entityName: 'UserAvatar',
    id: current?.id ?? '',
    createdAt: current?.createdAt ?? new Date(),
    updatedAt: new Date(),
    avatarType: 'none',
    avatarUrl: '',
    telegramHash: current?.telegramHash ?? null,
    mediaId: null,
    media: null,
    ...partial
  }
}
</script>

<style lang="sass" scoped>
.avatar-edit-modal
  display: flex
  flex-direction: column
  gap: 1em

  &__preview
    display: flex
    justify-content: center
    font-size: 120px
</style>
