<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">✦ TaskFlow</div>
      <h1 class="auth-title">Créer un compte</h1>
      <p class="auth-sub">Compte utilisateur — gérez vos tâches publiques et privées.</p>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="form-group">
        <label>Nom complet</label>
        <input v-model="name" type="text" placeholder="Jean Dupont" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="vous@exemple.com" />
      </div>
      <div class="form-group">
        <label>Mot de passe</label>
        <input v-model="password" type="password" placeholder="Min. 6 caractères" />
        <div class="pwd-strength" v-if="password">
          <div
            class="pwd-bar"
            :style="{ width: pwdStrength.pct + '%', background: pwdStrength.color }"
          ></div>
          <span :style="{ color: pwdStrength.color }">{{ pwdStrength.label }}</span>
        </div>
      </div>
      <div class="form-group">
        <label>Confirmer le mot de passe</label>
        <input v-model="confirm" type="password" @keyup.enter="submit" />
      </div>

      <!-- Info rôle -->
      <div class="role-info">
        <div class="role-badge">👤 Utilisateur</div>
 
      </div>

      <button class="btn btn-primary" style="width:100%; margin-top:8px" @click="submit" :disabled="loading">
        {{ loading ? 'Création en cours…' : 'Créer mon compte' }}
      </button>

      <p class="auth-link">
        Déjà un compte ? <router-link to="/login">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth    = useAuthStore()
const router  = useRouter()

const name     = ref('')
const email    = ref('')
const password = ref('')
const confirm  = ref('')
const error    = ref('')
const loading  = ref(false)

// Force du mot de passe
const pwdStrength = computed(() => {
  const p = password.value
  if (!p) return { pct: 0, color: '#ccc', label: '' }
  let score = 0
  if (p.length >= 6)  score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const levels = [
    { pct: 20,  color: '#E24B4A', label: 'Très faible' },
    { pct: 40,  color: '#f59e0b', label: 'Faible' },
    { pct: 60,  color: '#f59e0b', label: 'Moyen' },
    { pct: 80,  color: '#22c55e', label: 'Fort' },
    { pct: 100, color: '#16a34a', label: 'Très fort' },
  ]
  return levels[Math.min(score, 4)]
})

async function submit() {
  error.value = ''
  if (!name.value || !email.value || !password.value) {
    error.value = 'Tous les champs sont obligatoires.'; return
  }
  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit faire au moins 6 caractères.'; return
  }
  if (password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'; return
  }

  loading.value = true
  const result = await auth.register(name.value, email.value, password.value)
  loading.value = false

  if (!result.ok) { error.value = result.error; return }
  router.push('/dashboard')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 24px; background: var(--gray-1);
}
.auth-card  { width: 100%; max-width: 420px; }
.auth-logo  { font-size: 22px; font-weight: 700; color: var(--blue); margin-bottom: 12px; text-align: center; }
.auth-title { font-size: 18px; font-weight: 600; margin-bottom: 4px; text-align: center; }
.auth-sub   { font-size: 13px; color: var(--gray-5); text-align: center; margin-bottom: 20px; }
.auth-link  { text-align: center; margin-top: 16px; font-size: 13px; color: var(--gray-5); }
.auth-link a { color: var(--blue); text-decoration: none; font-weight: 500; }

/* Force mot de passe */
.pwd-strength { margin-top: 6px; }
.pwd-bar {
  height: 4px; border-radius: 99px; transition: all .3s; margin-bottom: 4px;
  background: var(--gray-3);
}
.pwd-strength span { font-size: 11px; font-weight: 500; }

/* Rôle info */
.role-info {
  background: var(--blue-lt); border: 1px solid #c7d4fc;
  border-radius: var(--radius); padding: 12px 14px; margin-bottom: 4px;
}
.role-badge { font-weight: 600; color: var(--blue); margin-bottom: 8px; font-size: 13px; }
.role-perms { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.role-perms li { font-size: 12px; color: var(--gray-7); }
</style>