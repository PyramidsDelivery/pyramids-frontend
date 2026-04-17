import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth' // Importe sua store de autenticação

import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'
import FretesAdminView from '../views/FretesAdminView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: CadastroView
  },
  {
    path: '/fretesadm',
    name: 'fretesadm',
    component: FretesAdminView,
    meta: { requiresAuth: true } 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// O "Guarda" da rota: roda antes de cada navegação
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Se a rota exige autenticação e o usuário não está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
}
  // Se o usuário já está logado e tenta ir para o login ou cadastro
  else if ((to.name === 'login' || to.name === 'cadastro') && authStore.isAuthenticated) {
    // Manda ele direto para o painel administrativo
    next({ name: 'fretesadm' })
  }
  else {
    // Segue viagem normalmente
    next()
  }
})

export default router