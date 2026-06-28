<template>
  <div class="nootube-video-comments">
    <div
      v-if="authStore.isAuthenticated"
      class="nootube-video-comments__form"
    >
      <noo-textarea
        v-model="newContent"
        placeholder="Написать комментарий..."
        :validators="[validateContent]"
      />
      <div class="nootube-video-comments__form__actions">
        <noo-button
          size="small"
          :disabled="!canSubmitNew || isSubmitting"
          @click="submitNew"
        >
          Отправить
        </noo-button>
      </div>
    </div>

    <div
      v-if="isInitialLoading"
      class="nootube-video-comments__state"
    >
      <noo-loader-icon />
    </div>

    <noo-error-block
      v-else-if="error"
      with-image
      centered
      :try-again="() => load(true)"
    >
      <noo-title :size="4">Не удалось загрузить комментарии</noo-title>
    </noo-error-block>

    <noo-text-block
      v-else-if="!comments.length"
      class="nootube-video-comments__state"
      dimmed
    >
      Пока нет комментариев. Будьте первым!
    </noo-text-block>

    <ul
      v-else
      class="nootube-video-comments__list"
    >
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="nootube-video-comments__list__item"
      >
        <noo-user-avatar
          class="nootube-video-comments__list__item__avatar"
          :name="comment.user?.name ?? '?'"
          :avatar="comment.user?.avatar"
        />
        <div class="nootube-video-comments__list__item__body">
          <div class="nootube-video-comments__list__item__head">
            <noo-title :size="4">
              {{ comment.user?.name ?? 'Пользователь' }}
            </noo-title>
            <span class="nootube-video-comments__list__item__date">
              {{ formatDate(comment.createdAt) }}
            </span>
            <div
              v-if="
                can(NooTubePermissions.manageComment, {
                  target: { id: comment.userId }
                })
              "
              class="nootube-video-comments__list__item__actions"
            >
              <noo-dropdown :actions="actionsFor(comment)" />
            </div>
          </div>

          <template v-if="editedId === comment.id">
            <noo-textarea
              v-model="editedContent"
              :validators="[validateContent]"
            />
            <div class="nootube-video-comments__list__item__edit-actions">
              <noo-button
                size="small"
                :disabled="!canSubmitEdit || isSubmitting"
                @click="submitEdit(comment)"
              >
                Сохранить
              </noo-button>
              <noo-button
                size="small"
                variant="inline"
                @click="cancelEdit"
              >
                Отмена
              </noo-button>
            </div>
          </template>
          <noo-text-block
            v-else
            class="nootube-video-comments__list__item__content"
          >
            {{ comment.content }}
          </noo-text-block>
        </div>
      </li>
    </ul>

    <div
      v-if="hasMore"
      class="nootube-video-comments__more"
    >
      <noo-button
        variant="secondary"
        size="small"
        :disabled="isLoading"
        @click="loadMore"
      >
        Показать ещё
      </noo-button>
    </div>

    <noo-sure-modal
      v-model:is-open="isDeleteOpen"
      @confirm="confirmDelete"
    >
      <template #title>
        <noo-title :size="3"> Удалить комментарий? </noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          Комментарий будет удалён безвозвратно.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Удалить </template>
    </noo-sure-modal>
  </div>
</template>

<script setup lang="ts">
import type { DropdownAction } from '@/components/dialog/noo-dropdown.vue'
import { isApiError } from '@/core/api/api.utils'
import { useAuthStore } from '@/core/stores/auth.store'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { DateHelpers } from '@/core/utils/dates'
import { Pagination } from '@/core/utils/pagination.utils'
import { isStringOfLength } from '@/core/validators/string.utils'
import { computed, ref } from 'vue'
import { NooTubeService } from '../api/nootube.service'
import type { NooTubeVideoCommentEntity } from '../api/nootube.types'
import { NooTubePermissions, useNooTubePermissions } from '../permissions'

interface Props {
  videoId: string
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const globalUiStore = useGlobalUIStore()
const { can } = useNooTubePermissions()

const PAGE_SIZE = 20

const comments = ref<NooTubeVideoCommentEntity[]>([])
const total = ref(0)
const page = ref(1)
const isLoading = ref(false)
const isLoaded = ref(false)
const error = ref(false)

const newContent = ref('')
const isSubmitting = ref(false)

const editedId = ref<string | null>(null)
const editedContent = ref('')

const isDeleteOpen = ref(false)
const deletedComment = ref<NooTubeVideoCommentEntity | null>(null)

const isInitialLoading = computed(() => isLoading.value && !isLoaded.value)
const hasMore = computed(() => comments.value.length < total.value)
const canSubmitNew = computed(() => validateContent(newContent.value) === true)
const canSubmitEdit = computed(
  () => validateContent(editedContent.value) === true
)

function validateContent(value: string) {
  return isStringOfLength(value, 1, 5000)
}

const formatDate = (date: Date) =>
  DateHelpers.formatDate(date, { includeTime: true })

function actionsFor(comment: NooTubeVideoCommentEntity): DropdownAction[] {
  return [
    {
      label: 'Редактировать',
      icon: 'edit',
      onClick: () => startEdit(comment)
    },
    {
      label: 'Удалить',
      icon: 'delete',
      variant: 'danger',
      onClick: () => openDelete(comment)
    }
  ]
}

async function load(reset = false): Promise<void> {
  if (reset) {
    page.value = 1
  }

  isLoading.value = true
  error.value = false

  const response = await NooTubeService.getComments(
    props.videoId,
    new Pagination(page.value, PAGE_SIZE)
  )

  isLoading.value = false
  isLoaded.value = true

  if (isApiError(response)) {
    error.value = true

    return
  }

  const items = response.data ?? []

  comments.value =
    reset || page.value === 1 ? items : [...comments.value, ...items]
  total.value = response.meta?.total ?? items.length
}

function loadMore(): void {
  page.value += 1
  load()
}

async function submitNew(): Promise<void> {
  if (!canSubmitNew.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  const response = await NooTubeService.createComment(props.videoId, {
    _entityName: 'NooTubeVideoComment',
    _key: 'new',
    userId: authStore.userId ?? '',
    content: newContent.value
  })

  isSubmitting.value = false

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      'Не удалось отправить комментарий',
      response.error
    )

    return
  }

  newContent.value = ''
  globalUiStore.createSuccessToast('Комментарий добавлен')
  load(true)
}

function startEdit(comment: NooTubeVideoCommentEntity): void {
  editedId.value = comment.id
  editedContent.value = comment.content
}

function cancelEdit(): void {
  editedId.value = null
  editedContent.value = ''
}

async function submitEdit(comment: NooTubeVideoCommentEntity): Promise<void> {
  if (!canSubmitEdit.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  const response = await NooTubeService.updateComment(
    props.videoId,
    comment.id,
    [{ op: 'replace', path: '/content', value: editedContent.value }]
  )

  isSubmitting.value = false

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      'Не удалось сохранить комментарий',
      response.error
    )

    return
  }

  comment.content = editedContent.value
  cancelEdit()
}

function openDelete(comment: NooTubeVideoCommentEntity): void {
  deletedComment.value = comment
  isDeleteOpen.value = true
}

async function confirmDelete(): Promise<void> {
  const comment = deletedComment.value

  if (!comment) {
    return
  }

  const response = await NooTubeService.deleteComment(props.videoId, comment.id)

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      'Не удалось удалить комментарий',
      response.error
    )

    return
  }

  comments.value = comments.value.filter((item) => item.id !== comment.id)
  total.value = Math.max(0, total.value - 1)
  globalUiStore.createSuccessToast('Комментарий удалён')
}

load(true)
</script>

<style scoped lang="sass">
.nootube-video-comments
  display: flex
  flex-direction: column
  gap: 1.5em

  &__form
    display: flex
    flex-direction: column
    gap: 0.5em

    &__actions
      display: flex
      justify-content: flex-end

  &__state
    display: flex
    justify-content: center
    padding: 1.5em 0

  &__list
    display: flex
    flex-direction: column
    gap: 1.5em
    margin: 0
    padding: 0
    list-style: none

    &__item
      display: flex
      gap: 0.75em

      &__avatar
        font-size: 2.25em
        flex-shrink: 0

      &__body
        flex: 1
        display: flex
        flex-direction: column
        gap: 0.35em
        min-width: 0

      &__head
        display: flex
        align-items: center
        gap: 0.75em

        .noo-title
          margin: 0

      &__date
        color: var(--text-light)
        font-size: 0.85em

      &__actions
        margin-left: auto

      &__content
        margin: 0
        white-space: pre-line
        word-break: break-word

      &__edit-actions
        display: flex
        gap: 0.5em

  &__more
    display: flex
    justify-content: center
</style>
