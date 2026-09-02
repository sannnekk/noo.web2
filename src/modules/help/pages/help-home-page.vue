<template>
  <div class="help-home-page">
    <help-hero-search />
    <help-category-cards />
    <noo-warning-block
      v-if="store.hasFailed"
      small
    >
      Не удалось загрузить часть статей — поиск найдёт не всё.
      <noo-button
        variant="inline"
        size="small"
        :is-loading="store.isLoading"
        @click="store.load(true)"
      >
        Попробовать ещё раз
      </noo-button>
    </noo-warning-block>
    <help-quick-start />
    <help-faq />
    <help-contacts />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import HelpCategoryCards from '../components/help-category-cards.vue'
import HelpContacts from '../components/help-contacts.vue'
import HelpFaq from '../components/help-faq.vue'
import HelpHeroSearch from '../components/help-hero-search.vue'
import HelpQuickStart from '../components/help-quick-start.vue'
import { useHelpHomeStore } from '../stores/help-home.store'

const store = useHelpHomeStore()

// The store keeps what it loaded, so coming back from an article does not
// refetch — the call is a no-op unless the articles are not in yet.
onMounted(() => store.load())
</script>

<style scoped lang="sass">
.help-home-page
  display: flex
  flex-direction: column
  gap: var(--space-xl)
  padding-bottom: var(--space-l)
</style>
