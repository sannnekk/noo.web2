<template>
  <div class="noo-tabs-view">
    <div class="noo-tabs-view__titles">
      <div class="noo-tabs-view__titles__row">
        <template
          v-for="tab in tabKeys"
          :key="tab"
        >
          <component
            :is="useRouteTabs ? 'router-link' : 'div'"
            :to="getRouteName(tab)"
            class="noo-tabs-view__titles__title"
            :class="{
              'noo-tabs-view__titles__title--active': isTabActive(tab)
            }"
            @click="useRouteTabs ? null : (activeTab = tab)"
          >
            <div class="noo-tabs-view__titles__title__inner">
              <slot
                :name="`tab-title-${tab}`"
                :is-active="isTabActive(tab)"
              >
                {{ tab }}
              </slot>
            </div>
          </component>
        </template>
      </div>
      <div class="noo-tabs-view__titles__slot">
        <slot name="actions" />
      </div>
    </div>
    <div class="noo-tabs-view__tabs">
      <template
        v-for="tab in tabKeys"
        :key="tab"
      >
        <div
          v-if="tab === activeTab"
          class="noo-tabs-view__tabs__tab"
        >
          <slot
            :name="`tab-${tab}`"
            :is-active="tab === activeTab"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: refactor the component
import { computed, onMounted, watch, type VNode } from 'vue'
import { useRoute } from 'vue-router'

interface Slots {
  actions: () => VNode | VNode[] | null
  [key: `tab-${string}`]: (props: {
    isActive: boolean
  }) => VNode | VNode[] | null
  [key: `tab-title-${string}`]: (props: {
    isActive: boolean
  }) => VNode | VNode[] | null
}

interface Props {
  useRouteTabs?: boolean
  routeParamName?: string
}

const props = withDefaults(defineProps<Props>(), {
  useRouteTabs: false
})
const slots = defineSlots<Slots>()
const route = useRoute()

const tabKeys = computed(() => {
  return Object.keys(slots)
    .filter((key) => key.startsWith('tab-') && !key.startsWith('tab-title-'))
    .map((key) => key.slice(4))
})

const activeTab = defineModel<string>('activeTab', {
  default: ''
})

if (props.useRouteTabs) {
  watch(
    () => route.params[props.routeParamName!],
    (newTab) => {
      if (newTab && tabKeys.value.includes(newTab as string)) {
        activeTab.value = newTab as string
      } else if (tabKeys.value.length > 0) {
        activeTab.value = tabKeys.value[0]
      }
    },
    { immediate: true }
  )
}

onMounted(() => {
  if (!activeTab.value && tabKeys.value.length > 0) {
    activeTab.value = tabKeys.value[0]
  }
})

function getRouteName(tab: string) {
  return {
    name: route.name,
    params: props.useRouteTabs
      ? {
          [props.routeParamName!]: tab
        }
      : undefined
  }
}

function isTabActive(tab: string) {
  return activeTab.value === tab
}
</script>

<style scoped lang="sass">
.noo-tabs-view
  &__titles
    &__row
      display: flex
      align-items: center
      justify-content: flex-start
      gap: 0.5em
      padding: 0.5rem 0.5rem

    &__title
      display: block
      cursor: pointer
      font-size: 0.9em
      color: var(--form-text-color)
      text-decoration: none

      &--active
        color: var(--white)
        font-weight: bold

        .noo-tabs-view__titles__title__inner
          background-color: var(--lila) !important

      &:hover
        .noo-tabs-view__titles__title__inner
          background-color: var(--light)

      &__inner
        width: 100%
        height: 100%
        background-color: transparent
        border-radius: var(--border-radius)
        transition: 0.2s ease all
        padding: 0.4em 0.7em
</style>
