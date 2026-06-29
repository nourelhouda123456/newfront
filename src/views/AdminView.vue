<template>
  <div class="page">
    <h1 class="page-title">Gestion des utilisateurs</h1>

    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <!-- Stats bar -->
    <div class="admin-stats card" style="margin-bottom:20px">
      <div class="admin-stat">
        <div class="admin-stat-val">{{ users.length }}</div>
        <div class="admin-stat-lbl">Utilisateurs</div>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-val">{{ admins }}</div>
        <div class="admin-stat-lbl">Admins</div>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-val">{{ activeCount }}</div>
        <div class="admin-stat-lbl">Actifs</div>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-val">{{ totalTasks }}</div>
        <div class="admin-stat-lbl">Tâches au total</div>
      </div>
    </div>

    <!-- Search -->
    <div class="card">
      <div class="table-toolbar">
        <input v-model="search" placeholder="🔍 Rechercher un utilisateur…" class="search-input" />
      </div>
      <UserTable
        :users="filteredUsers"
        :current-id="auth.currentUser.id"
        @toggle-active="handleToggle"
        @change-role="handleRole"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'
import UserTable from '../components/UserTable.vue'

const auth  = useAuthStore()
const tasks = useTasksStore()

const search  = ref('')
const success = ref('')

const users = computed(() => auth.getAllUsers())
const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

const admins     = computed(() => users.value.filter(u => u.role === 'admin').length)
const activeCount= computed(() => users.value.filter(u => u.active).length)
const totalTasks = computed(() => tasks.tasks.length)

function flash(msg) {
  success.value = msg
  setTimeout(() => success.value = '', 3000)
}

function handleToggle(id) {
  auth.toggleUserActive(id)
  flash('Statut mis à jour.')
}
function handleRole(id, role) {
  auth.changeUserRole(id, role)
  flash('Rôle mis à jour.')
}
function handleDelete(id) {
  if (!confirm('Supprimer définitivement cet utilisateur ?')) return
  auth.deleteUser(id)
  flash('Utilisateur supprimé.')
}
</script>

<style scoped>
.admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); }
.admin-stat  { text-align: center; padding: 8px; }
.admin-stat + .admin-stat { border-left: 1px solid var(--gray-2); }
.admin-stat-val { font-size: 24px; font-weight: 700; color: var(--blue); }
.admin-stat-lbl { font-size: 11px; color: var(--gray-5); text-transform: uppercase; letter-spacing: .4px; }

.table-toolbar { padding-bottom: 14px; border-bottom: 1px solid var(--gray-2); margin-bottom: 4px; }
.search-input  { padding: 7px 12px; border: 1px solid var(--gray-3); border-radius: var(--radius); font-size: 13px; width: 260px; }
</style>
