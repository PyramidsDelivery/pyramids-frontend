import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '../stores/useDataStore'
import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'
import FretesAdminView from '../views/FretesAdminView.vue'
import HubAdminView from '../views/HubAdminView.vue'
import UsuariosListView from '../views/UsuariosListView.vue'
import UsuarioHubView from '../views/UsuarioHubView.vue'
import CriarFreteView from '../views/CriarFreteView.vue'
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
    path: '/usuario-hub',
    name: 'usuario-hub',
    component: UsuarioHubView,
    meta: { requiresAuth: true }
  },
  {
    path: '/fretesadm',
    name: 'fretesadm',
    component: FretesAdminView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/hubadmin',
    name: 'hubadmin',
    component: HubAdminView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/usuarioslist',
    name: 'usuarioslist',
    component: UsuariosListView,
    meta: { requiresAdmin: true }
  },
  {
  path: '/fretes/novo',
  name: 'criar-frete',
  component: CriarFreteView,
  meta: { requiresAdmin: true }
},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const store = useDataStore()
  const token = store.token || localStorage.getItem('token')
  const isStaff = store.isStaff || localStorage.getItem('is_staff') === 'true'
  const isSuper = store.isSuperuser || localStorage.getItem('is_superuser') === 'true'

  // 1. Verificar se a rota exige apenas autenticação comum
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' })
  }

  // 2. Verificar se a rota exige cargo de Admin/Staff
  if (to.meta.requiresAdmin) {
    if (!token) {
      next({ name: 'login' })
    } else if (isStaff || isSuper) {
      next() // É admin, pode passar
    } else {
      next({ name: 'usuario-hub' }) // Não é admin, manda para o hub do usuário
    }
  } else {
    next() // Rota pública (Login/Cadastro)
  }
})

export default router