import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '../stores/useDataStore'
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
    component: FretesAdminView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const store = useDataStore()
  if (to.name === 'fretesadm' && !store.token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router