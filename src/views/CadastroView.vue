<script setup>
import { useRouter } from 'vue-router'
import logo from '../assets/logo.png'
import LightButton from '../components/LightButton.vue'

const router = useRouter()

function irParaLogin() {
  router.push('/')
}
</script>

<template>
  <div class="container">
    <!-- LADO ESQUERDO -->
    <div class="left">
      <!-- LOGO -->
      <img :src="logo" alt="logo" class="logo" />

      <div class="left-content">
        <h1>Já tem uma conta?</h1>
        <p>Faça Login.</p>

        <!-- TROCA AQUI -->
        <LightButton label="Login" @click="irParaLogin" />
      </div>
    </div>

    <!-- LADO DIREITO -->
    <div class="right">
      <h1>Crie sua conta!</h1>
      <p>Preencha seus dados</p>

      <input type="text" placeholder="Nome" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Senha" />
      <input type="password" placeholder="Confirmar Senha" />

      <button class="btn-light">Cadastrar</button>
    </div>
  </div>
</template>

<style scoped>
/* mantém vazio como você deixou */
</style>