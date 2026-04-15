<script setup>
import { useRouter } from 'vue-router'
import logo from '../assets/logo.png'

const router = useRouter()

function irParaCadastro() {
  router.push('/cadastro')
}
</script>

<template>
  <div class="container">
    <!-- LADO ESQUERDO -->
    <div class="left">
      <!-- LOGO -->
      <div class="logo">
         <img :src="logo" alt="Logo" />
      </div>
       

      <div class="left-content">
        <h1>Não tem uma conta?</h1>
        <p>Cadastre-se.</p>

        <button class="btn-cadastro" @click="irParaCadastro">
          Cadastro
        </button>
      </div>
    </div>

    <!-- LADO DIREITO -->
    <div class="right">
      <h1>Bem-vindo de volta!</h1>
      <p>Acesse sua conta agora mesmo.</p>

      <input type="text" placeholder="Nome" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Senha" />

      <button class="btn-login">Entrar</button>
    </div>
  </div>
</template>

<style scoped>

</style>