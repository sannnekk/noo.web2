<template>
  <div
    v-if="assignedWorkDetailStore.assignedWork?.work"
    class="assigned-work-sidebar"
  >
    <div class="assigned-work-sidebar__subject">
      <noo-subject-block
        :subject="assignedWorkDetailStore.assignedWork.work.subject ?? null"
      />
    </div>
    <div class="assigned-work-sidebar__title">
      <noo-title :size="3">
        {{ assignedWorkDetailStore.assignedWork.title }}
      </noo-title>
    </div>
    <div
      v-if="assignedWorkDetailStore.assignedWork.work.description"
      class="assigned-work-sidebar__description"
    >
      <noo-text-block
        dimmed
        size="small"
      >
        {{ assignedWorkDetailStore.assignedWork.work.description }}
      </noo-text-block>
    </div>
    <div class="assigned-work-sidebar__info">
      <div class="assigned-work-sidebar__info__line">
        <noo-text-block
          dimmed
          size="small"
        >
          <span>Статус сдачи:</span>
          &nbsp;
          <noo-solve-status-tag
            class="assigned-work-sidebar__info__line__status"
            :status="assignedWorkDetailStore.assignedWork.solveStatus"
          />
        </noo-text-block>
      </div>
      <div class="assigned-work-sidebar__info__line">
        <noo-text-block
          dimmed
          size="small"
        >
          <span>Дедлайн сдачи:</span>
          <br>
          <noo-date
            :value="assignedWorkDetailStore.assignedWork.solveDeadlineAt"
            timezones="both"
            include-time
          />
        </noo-text-block>
      </div>
      <div class="assigned-work-sidebar__info__line">
        <noo-text-block
          v-if="assignedWorkDetailStore.assignedWork.solveStatus === 'solved'"
          dimmed
          size="small"
        >
          <span>Сдано:</span>
          &nbsp;
          <noo-date
            :value="assignedWorkDetailStore.assignedWork.solvedAt"
            include-time
            timezones="both"
          />
        </noo-text-block>
      </div>
      <div class="assigned-work-sidebar__info__line">
        <noo-text-block
          dimmed
          size="small"
        >
          <span>Статус проверки:</span>
          &nbsp;
          <b>
            <noo-check-status-tag
              class="assigned-work-sidebar__info__line__status"
              :status="assignedWorkDetailStore.assignedWork.checkStatus"
            />
          </b>
        </noo-text-block>
      </div>
      <div class="assigned-work-sidebar__info__line">
        <noo-text-block
          dimmed
          size="small"
        >
          <span>Дедлайн проверки:</span>
          <br>
          <noo-date
            :value="assignedWorkDetailStore.assignedWork.checkDeadlineAt"
            timezones="both"
            include-time
          />
        </noo-text-block>
      </div>
      <div class="assigned-work-sidebar__info__line">
        <noo-text-block
          v-if="assignedWorkDetailStore.assignedWork.checkedAt"
          dimmed
          size="small"
          class="assigned-work-sidebar__info__line"
        >
          <span>Проверено:</span>
          &nbsp;
          <noo-date
            :value="assignedWorkDetailStore.assignedWork.checkedAt"
            include-time
            timezones="both"
          />
        </noo-text-block>
      </div>
    </div>
    <div class="assigned-work-sidebar__task-grid">
      <task-grid />
    </div>
    <div class="assigned-work-sidebar__comments">
      <noo-text-block size="small">
        <noo-inline-link
          :to="{
            name: 'assigned-works.detail.comments'
          }"
          class="assigned-work-sidebar__comments__link"
        >
          Комментарии к работе
        </noo-inline-link>
      </noo-text-block>
    </div>
    <div class="assigned-work-sidebar__score">
      <assigned-work-score
        :score="assignedWorkDetailStore.assignedWork.score"
        :max-score="assignedWorkDetailStore.assignedWork.maxScore"
      />
    </div>
    <div class="assigned-work-sidebar__actions">
      <assigned-work-actions />
    </div>
    <div
      v-if="assignedWorkDetailStore.assignedWork.student"
      class="assigned-work-sidebar__student"
    >
      <noo-text-block
        size="small"
        dimmed
      >
        Ученик:
      </noo-text-block>
      <noo-user-card :user="assignedWorkDetailStore.assignedWork.student" />
    </div>
    <div
      v-if="assignedWorkDetailStore.assignedWork.mainMentor"
      class="assigned-work-sidebar__main-mentor"
    >
      <noo-text-block
        size="small"
        dimmed
      >
        Проверяющий куратор:
      </noo-text-block>
      <noo-user-card :user="assignedWorkDetailStore.assignedWork.mainMentor" />
    </div>
    <div
      v-if="assignedWorkDetailStore.assignedWork.helperMentor"
      class="assigned-work-sidebar__helper-mentor"
    >
      <noo-text-block
        size="small"
        dimmed
      >
        Помогающий куратор:
      </noo-text-block>
      <noo-user-card
        :user="assignedWorkDetailStore.assignedWork.helperMentor"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import assignedWorkActions from './assigned-work-actions.vue'
import assignedWorkScore from './assigned-work-score.vue'
import TaskGrid from './task-grid.vue'

const assignedWorkDetailStore = useAssignedWorkDetailStore()
</script>

<style lang="sass" scoped>
.assigned-work-sidebar
  &__info
    &__line
      &__status
        font-weight: bold
</style>
