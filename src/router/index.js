import { createRouter, createWebHistory } from 'vue-router'

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

export default router