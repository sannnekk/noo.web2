<template>
  <div class="help-articles-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <div class="help-articles-page__sidebar">
          <noo-title
            :size="3"
            no-margin
          >
            Статьи
          </noo-title>
          <div
            v-if="store.isListLoading"
            class="help-articles-page__loading"
          >
            <noo-loader-icon />
          </div>
          <noo-error-block
            v-else-if="store.listError"
            :try-again="() => store.loadArticles(category)"
          >
            <noo-title :size="4">Не удалось загрузить статьи</noo-title>
          </noo-error-block>
          <noo-text-block
            v-else-if="!store.articles.length"
            dimmed
            size="small"
          >
            В этом разделе пока нет статей
          </noo-text-block>
          <div
            v-else
            class="help-articles-page__list"
          >
            <noo-inline-link
              v-for="item in store.articles"
              :key="item.id"
              :to="{
                name: 'help.articles.detail',
                params: { category, articleSlug: item.slug }
              }"
            >
              {{ item.title }}
            </noo-inline-link>
          </div>

          <div
            v-if="canManage"
            class="help-articles-page__actions"
          >
            <noo-button
              variant="secondary"
              @click="onAddArticle()"
            >
              Добавить статью
            </noo-button>
          </div>
        </div>
      </template>
      <template #content>
        <help-article-detail-page v-if="store.mode === 'create'" />
        <template v-else>
          <noo-animated-router-view />
          <noo-text-block
            v-if="route.name === 'help.articles'"
            dimmed
          >
            Выберите статью слева, чтобы прочитать её.
          </noo-text-block>
        </template>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { SupportCategory } from '../api/support.types'
import { HelpPermissions, useHelpPermissions } from '../permissions'
import { useHelpEditStore } from '../stores/help-edit.store'
import HelpArticleDetailPage from './help-article-detail-page.vue'

interface Props {
  category: SupportCategory
}

const props = defineProps<Props>()

const store = useHelpEditStore()
const route = useRoute()
const router = useRouter()
const { can } = useHelpPermissions()

const canManage = computed(() => can(HelpPermissions.manageArticles))

watch(
  () => props.category,
  (category) => store.loadArticles(category),
  {
    immediate: true
  }
)

async function onAddArticle(): Promise<void> {
  if (route.name !== 'help.articles') {
    await router.push({
      name: 'help.articles',
      params: { category: props.category }
    })
  }

  store.startCreate(props.category)
}
</script>

<style scoped lang="sass">
.help-articles-page
  &__sidebar
    display: flex
    flex-direction: column
    gap: 1em

  &__list
    display: flex
    flex-direction: column
    gap: 8px

  &__loading
    display: flex
    justify-content: center
    padding: 1em 0

  &__actions
    padding-top: 0.5em
</style>
