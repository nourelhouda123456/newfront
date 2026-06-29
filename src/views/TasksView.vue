<template>
  <div class="page">
    <div class="tasks-header">
      <h1 class="page-title" style="margin-bottom:0">
        {{ auth.isAdmin ? 'Toutes les tâches' : 'Mes tâches' }}
      </h1>
      <button class="btn btn-primary" @click="openModal()">+ Nouvelle tâche</button>
    </div>

    <!-- Filtres -->
    <div class="filters">
      <button
        v-for="f in filters" :key="f.value"
        :class="['btn btn-sm', activeFilter === f.value ? 'btn-primary' : 'btn-ghost']"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
        <span class="filter-count">{{ f.count }}</span>
      </button>

      <input
        v-model="search" placeholder="🔍 Rechercher…"
        class="search-input"
      />
    </div>

    <!-- Grid de tâches -->
    <div v-if="filteredTasks.length === 0" class="empty-state">
      <p>{{ search ? 'Aucun résultat.' : 'Aucune tâche ici.' }}</p>
      <button v-if="!search" class="btn btn-primary" @click="openModal()">Créer une tâche</button>
    </div>
    <div class="tasks-grid" v-else>
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        :users="allUsers"
        @edit="openModal"
        @delete="deleteTask"
        @update-status="(id, s) => tasksStore.updateTask(id, { status: s })"
      />
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal card">
        <div class="modal-header">
          <h2>{{ editingTask ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>
          <button class="btn btn-ghost btn-sm" @click="closeModal">✕</button>
        </div>

        <div class="form-group">
          <label>Titre *</label>
          <input v-model="form.title" placeholder="Titre de la tâche" />
          <span v-if="formError && !form.title" class="error-msg">Champ obligatoire</span>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="3" placeholder="Détails optionnels…"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>Priorité</label>
            <select v-model="form.priority">
              <option value="low">🔵 Basse</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🔴 Haute</option>
            </select>
          </div>
          <div class="form-group" style="flex:1" v-if="editingTask">
            <label>Statut</label>
            <select v-model="form.status">
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" @click="submitForm">
            {{ editingTask ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'
import TaskCard from '../components/TaskCard.vue'

const auth       = useAuthStore()
const tasksStore = useTasksStore()

const activeFilter = ref('all')
const search       = ref('')
const showModal    = ref(false)
const editingTask  = ref(null)
const formError    = ref(false)

const form = reactive({ title: '', description: '', priority: 'medium', status: 'todo' })

const allUsers = computed(() => auth.getAllUsers())

const visibleTasks = computed(() => tasksStore.getVisibleTasks())

const filters = computed(() => [
  { value: 'all',         label: 'Toutes',   count: visibleTasks.value.length },
  { value: 'todo',        label: 'À faire',  count: visibleTasks.value.filter(t => t.status === 'todo').length },
  { value: 'in_progress', label: 'En cours', count: visibleTasks.value.filter(t => t.status === 'in_progress').length },
  { value: 'done',        label: 'Terminées',count: visibleTasks.value.filter(t => t.status === 'done').length },
])

const filteredTasks = computed(() => {
  let list = visibleTasks.value
  if (activeFilter.value !== 'all') list = list.filter(t => t.status === activeFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
  }
  return list.slice().reverse()
})

function openModal(task = null) {
  editingTask.value = task
  formError.value = false
  if (task) {
    form.title = task.title
    form.description = task.description || ''
    form.priority = task.priority
    form.status = task.status
  } else {
    form.title = ''; form.description = ''; form.priority = 'medium'; form.status = 'todo'
  }
  showModal.value = true
}

function closeModal() { showModal.value = false; editingTask.value = null }

function submitForm() {
  formError.value = true
  if (!form.title.trim()) return
  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, {
      title: form.title, description: form.description,
      priority: form.priority, status: form.status,
    })
  } else {
    tasksStore.addTask({ title: form.title, description: form.description, priority: form.priority })
  }
  closeModal()
}

function deleteTask(id) {
  if (confirm('Supprimer cette tâche ?')) tasksStore.deleteTask(id)
}
</script>

<style scoped>
.tasks-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.filter-count {
  background: rgba(0,0,0,.07); border-radius: 99px; padding: 1px 6px;
  font-size: 11px; margin-left: 2px;
}
.search-input { margin-left: auto; padding: 7px 12px; border: 1px solid var(--gray-3); border-radius: var(--radius); font-size: 13px; width: 200px; }

.tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.empty-state { text-align: center; padding: 48px; color: var(--gray-5); }
.empty-state p { margin-bottom: 12px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px;
}
.modal { width: 100%; max-width: 480px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h2 { font-size: 16px; font-weight: 600; }
.form-row { display: flex; gap: 12px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
</style>
