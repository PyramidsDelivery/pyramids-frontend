import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '../stores/useDataStore'
import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'
import FretesAdminView from '../views/FretesAdminView.vue'
import HubAdminView from '../views/HubAdminView.vue'
import UsuariosListView from '../views/UsuariosListView.vue'
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
    component: FretesAdminView
  },
  {
    path: '/hubadmin',
    name: 'hubadmin',
    component: HubAdminView
  },
  {
    path: '/usuarioslist',
    name: 'usuarioslist',
    component: UsuariosListView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const store = useDataStore()
  if (to.name === 'hubadmin' && !store.token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router