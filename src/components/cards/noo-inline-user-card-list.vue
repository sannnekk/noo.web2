<template>
  <div
    class="inline-user-card-list"
  >
    <noo-list-transition>
      <div
        v-for="user in usersModel"
        :key="user.id"
        class="inline-user-card-list__item"
      >
        <noo-inline-user-card
          class="inline-user-card-list__item__card"
          :user="user"
        />
      </div>
      <div
        v-if="users.length > 1"
        class="inline-user-card-list__more-button"
        @click="isOpened = !isOpened"
      >
        <slot
          name="more-button"
          :is-opened="isOpened"
        >
          {{ isOpened ? 'Скрыть' : 'Показать еще' }}
        </slot>
      </div>
      <div
        v-if="users.length === 0"
        class="inline-user-card-list__empty"
      >
        <slot name="empty">
          <noo-text-block
            size="small"
            dimmed
          >
            Пользователи не найдены
          </noo-text-block>
        </slot>
      </div>
    </noo-list-transition>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/core/data/entities/User';
import { computed, ref } from 'vue';

interface Props {
  users: User[]
}

const props = defineProps<Props>()

const isOpened = ref(false)
const usersModel = computed(() =>
  isOpened.value ? props.users : props.users.slice(0, 1)
)
</script>

<style lang="sass" scoped>
.inline-user-card-list
	&__item
		&__card
			margin-top: 0.3em
			margin-bottom: 0.3em

	&__more-button
		color: var(--text-light)
		font-size: 0.8em
		cursor: pointer

		&:hover
			color: var(--secondary)

	&__empty
		color: var(--text-light)
		font-size: 0.8em
</style>
