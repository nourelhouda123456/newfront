<template>
  <div class="page">
    <h1 class="page-title">Mon profil</h1>

    <div class="profile-grid">
      <!-- Informations -->
      <div class="card">
        <h2 class="section-title">Informations</h2>

        <div v-if="infoSuccess" class="alert alert-success">{{ infoSuccess }}</div>
        <div v-if="infoError"   class="alert alert-error">{{ infoError }}</div>

        <div class="profile-avatar">{{ initials }}</div>

        <div class="form-group">
          <label>Nom</label>
          <input v-model="infoForm.name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="infoForm.email" type="email" />
        </div>
        <div class="form-group">
          <label>Rôle</label>
          <input :value="auth.isAdmin ? 'Administrateur' : 'Utilisateur'" disabled />
        </div>
        <button class="btn btn-primary" @click="saveInfo">Enregistrer</button>
      </div>

      <!-- Changer mot de passe -->
      <div class="card">
        <h2 class="section-title">Changer le mot de passe</h2>

        <div v-if="pwdSuccess" class="alert alert-success">{{ pwdSuccess }}</div>
        <div v-if="pwdError"   class="alert alert-error">{{ pwdError }}</div>

        <div class="form-group">
          <label>Mot de passe actuel</label>
          <input v-model="pwdForm.current" type="password" />
        </div>
        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <input v-model="pwdForm.next" type="password" />
        </div>
        <div class="form-group">
          <label>Confirmer</label>
          <input v-model="pwdForm.confirm" type="password" />
        </div>
        <button class="btn btn-primary" @click="changePwd">Changer</button>
      </div>
    </div>

    <!-- Mes stats -->
    <div class="card" style="margin-top:16px">
      <h2 class="section-title">Mes statistiques</h2>
      <div class="mini-stats">
        <div class="mini-stat">
          <span class="ms-val">{{ myStats.total }}</span>
          <span class="ms-lbl">Tâches créées</span>
        </div>
        <div class="mini-stat">
          <span class="ms-val done">{{ myStats.done }}</span>
          <span class="ms-lbl">Terminées</span>
        </div>
        <div class="mini-stat">
          <span class="ms-val todo">{{ myStats.todo }}</span>
          <span class="ms-lbl">En attente</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'

const auth  = useAuthStore()
const tasks = useTasksStore()

onMounted(() => {
  tasks.fetchTasks()
})

// Info form
const infoForm    = reactive({ name: auth.currentUser?.name || '', email: auth.currentUser?.email || '' })
const infoSuccess = ref(''); const infoError = ref('')

// Password form
const pwdForm    = reactive({ current: '', next: '', confirm: '' })
const pwdSuccess = ref(''); const pwdError = ref('')

const initials = computed(() => {
  return (auth.currentUser?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
})

const myStats = computed(() => {
  const mine = tasks.tasks.filter(t => {
    const ownerId = t.owner?.id || t.owner?._id || t.owner
    return ownerId === auth.currentUser?.id
  })
  return {
    total: mine.length,
    done:  mine.filter(t => t.status === 'done').length,
    todo:  mine.filter(t => t.status === 'todo').length,
  }
})

async function saveInfo() {
  infoError.value = ''; infoSuccess.value = ''
  if (!infoForm.name || !infoForm.email) { infoError.value = 'Champs obligatoires.'; return }
  try {
    await auth.updateProfile(infoForm.name, infoForm.email)
    infoSuccess.value = 'Profil mis à jour.'
  } catch (err) {
    infoError.value = err.message || 'Erreur lors de la mise à jour.'
  }
}

async function changePwd() {
  pwdError.value = ''; pwdSuccess.value = ''
  if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) { pwdError.value = 'Tous les champs sont requis.'; return }
  if (pwdForm.next.length < 6) { pwdError.value = 'Minimum 6 caractères.'; return }
  if (pwdForm.next !== pwdForm.confirm) { pwdError.value = 'Les mots de passe ne correspondent pas.'; return }
  try {
    await auth.updatePassword(pwdForm.current, pwdForm.next)
    pwdForm.current = ''; pwdForm.next = ''; pwdForm.confirm = ''
    pwdSuccess.value = 'Mot de passe changé avec succès.'
  } catch (err) {
    pwdError.value = err.message || 'Erreur lors de la modification.'
  }
}
</script>

<style scoped>
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.section-title { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
.profile-avatar {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--blue-lt); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700; margin: 0 auto 20px;
}
.mini-stats { display: flex; gap: 24px; }
.mini-stat  { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ms-val     { font-size: 28px; font-weight: 700; }
.ms-val.done { color: var(--green); }
.ms-val.todo { color: var(--amber); }
.ms-lbl     { font-size: 12px; color: var(--gray-5); }
@media (max-width: 600px) { .profile-grid { grid-template-columns: 1fr; } }
</style>