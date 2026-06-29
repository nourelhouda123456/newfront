<template>
  <div class="page">
    <h1 class="page-title">
      Bonjour, {{ auth.currentUser?.name }} 👋
    </h1>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card card">
        <div class="stat-label">Total</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-label">À faire</div>
        <div class="stat-value todo">{{ stats.todo }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-label">En cours</div>
        <div class="stat-value progress">{{ stats.inProgress }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-label">Terminées</div>
        <div class="stat-value done">{{ stats.done }}</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="card progress-section" v-if="stats.total > 0">
      <div class="progress-label">
        <span>Progression globale</span>
        <strong>{{ Math.round((stats.done / stats.total) * 100) }}%</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (stats.done / stats.total * 100) + '%' }"></div>
      </div>
    </div>

    <!-- Admin extra info -->
    <div v-if="auth.isAdmin" class="card admin-banner">
      <div class="admin-banner-icon">⚙</div>
      <div>
        <div class="admin-banner-title">Panneau administrateur</div>
        <div class="admin-banner-desc">
          {{ totalUsers }} utilisateurs enregistrés. Gérez les comptes et les rôles.
        </div>
      </div>
      <router-link to="/admin" class="btn btn-primary btn-sm">Gérer les utilisateurs</router-link>
    </div>

    <!-- Recent tasks -->
    <div class="section-header">
      <h2 class="section-title">Tâches récentes</h2>
      <router-link to="/tasks" class="btn btn-ghost btn-sm">Voir tout →</router-link>
    </div>

    <div v-if="recentTasks.length === 0" class="empty-state">
      <p>Aucune tâche pour l'instant.</p>
      <router-link to="/tasks" class="btn btn-primary">Créer une tâche</router-link>
    </div>
    <div class="recent-list" v-else>
      <div v-for="task in recentTasks" :key="task.id" class="recent-item">
        <span :class="statusClass(task.status)">{{ statusLabel(task.status) }}</span>
        <span class="recent-title" :class="{ done: task.status === 'done' }">{{ task.title }}</span>
        <span class="priority-icon">{{ priorityIcon(task.priority) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'

const auth  = useAuthStore()
const tasks = useTasksStore()

const stats       = computed(() => tasks.getStats())
const recentTasks = computed(() => tasks.getVisibleTasks().slice(-5).reverse())
const totalUsers  = computed(() => auth.getAllUsers().length)

const statusLabel = s => ({ todo: 'À faire', in_progress: 'En cours', done: 'Terminé' }[s])
const statusClass = s => ({ todo: 'badge badge-todo', in_progress: 'badge badge-progress', done: 'badge badge-done' }[s])
const priorityIcon = p => ({ low: '🔵', medium: '🟡', high: '🔴' }[p])
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-card  { text-align: center; }
.stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: var(--gray-5); }
.stat-value { font-size: 32px; font-weight: 700; color: var(--gray-9); margin-top: 4px; }
.stat-value.todo     { color: var(--amber); }
.stat-value.progress { color: var(--blue); }
.stat-value.done     { color: var(--green); }

.progress-section { margin-bottom: 16px; }
.progress-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.progress-bar { background: var(--gray-2); border-radius: 99px; height: 8px; overflow: hidden; }
.progress-fill { background: var(--blue); height: 100%; border-radius: 99px; transition: width .4s; }

.admin-banner {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 24px; background: var(--blue-lt); border-color: #c7d4fc;
}
.admin-banner-icon { font-size: 24px; }
.admin-banner-title { font-weight: 600; font-size: 14px; color: var(--blue); }
.admin-banner-desc  { font-size: 12px; color: var(--gray-7); margin-top: 2px; }
.admin-banner .btn  { margin-left: auto; flex-shrink: 0; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-title  { font-size: 15px; font-weight: 600; }

.empty-state { text-align: center; padding: 32px; color: var(--gray-5); }
.empty-state p { margin-bottom: 12px; }

.recent-list { display: flex; flex-direction: column; gap: 8px; }
.recent-item {
  display: flex; align-items: center; gap: 10px;
  background: white; border: 1px solid var(--gray-3); border-radius: 8px;
  padding: 10px 14px;
}
.recent-title { flex: 1; font-size: 13px; font-weight: 500; }
.recent-title.done { text-decoration: line-through; color: var(--gray-5); }
.priority-icon { font-size: 14px; }
</style>
