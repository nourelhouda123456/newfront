import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
  const token       = ref(localStorage.getItem('token') || null)
  const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin         = computed(() => currentUser.value?.role === 'admin')

  // ── helpers ──────────────────────────────────────────────────
  function setSession(data) {
    token.value       = data.token
    currentUser.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function clearSession() {
    token.value       = null
    currentUser.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // ── actions ───────────────────────────────────────────────────
  async function register(name, email, password) {
    const res = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.message }
    setSession(data)
    return { ok: true }
  }

  async function login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.message }
    setSession(data)
    return { ok: true }
  }

  async function fetchMe() {
    if (!token.value) return
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    if (!res.ok) { clearSession(); return }
    const data = await res.json()
    currentUser.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function logout() {
    clearSession()
  }

  return {
    token, currentUser, isAuthenticated, isAdmin,
    register, login, logout, fetchMe,
  }
})