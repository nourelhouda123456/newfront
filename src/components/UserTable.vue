<template>
  <div class="user-table-wrap">
    <table class="user-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Statut</th>
          <th>Créé le</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" :class="{ 'row-me': user.id === currentId }">
          <td class="user-name">
            <div class="mini-avatar">{{ initials(user.name) }}</div>
            {{ user.name }}
            <span v-if="user.id === currentId" class="you-tag">vous</span>
          </td>
          <td class="text-muted">{{ user.email }}</td>
          <td>
            <select
              :value="user.role"
              :disabled="user.id === currentId"
              @change="e => $emit('change-role', user.id, e.target.value)"
              class="role-select"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
          </td>
          <td>
            <span :class="user.active ? 'badge badge-done' : 'badge badge-todo'">
              {{ user.active ? 'Actif' : 'Inactif' }}
            </span>
          </td>
          <td class="text-muted text-sm">{{ formatDate(user.createdAt) }}</td>
          <td>
            <div class="row-actions" v-if="user.id !== currentId">
              <button
                :class="['btn btn-sm', user.active ? 'btn-ghost' : 'btn-primary']"
                @click="$emit('toggle-active', user.id)"
              >
                {{ user.active ? 'Désactiver' : 'Activer' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="$emit('delete', user.id)">
                Supprimer
              </button>
            </div>
            <span v-else class="text-muted text-sm">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  users:     { type: Array, required: true },
  currentId: { type: Number, required: true },
})
defineEmits(['toggle-active', 'change-role', 'delete'])

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.user-table-wrap { overflow-x: auto; }
.user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.user-table th {
  text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600;
  color: var(--gray-5); text-transform: uppercase; letter-spacing: .5px;
  border-bottom: 1px solid var(--gray-3);
}
.user-table td { padding: 12px; border-bottom: 1px solid var(--gray-2); vertical-align: middle; }
.row-me td { background: #fafaf9; }

.user-name { display: flex; align-items: center; gap: 8px; font-weight: 500; }
.mini-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--blue-lt); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600; flex-shrink: 0;
}
.you-tag {
  font-size: 10px; padding: 1px 6px; border-radius: 99px;
  background: var(--gray-2); color: var(--gray-5); font-weight: 500;
}
.role-select {
  font-size: 12px; padding: 4px 6px; border-radius: 6px;
  border: 1px solid var(--gray-3); cursor: pointer;
}
.role-select:disabled { opacity: .5; cursor: not-allowed; }
.row-actions { display: flex; gap: 6px; }
.text-muted { color: var(--gray-5); }
.text-sm { font-size: 12px; }
</style>
