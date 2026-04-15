<script setup>
import { useRouter } from 'vue-router'
import logo from '../assets/logo.png'
import LightButton from '../components/LightButton.vue'

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
      

      <div class="left-content">
        <img :src="logo" alt="Logo" />
       <div class="left-text">
        <h1>Não tem uma conta?</h1>
        <p>Cadastre-se.</p>
      </div>

        <!-- TROCA AQUI -->
        <LightButton label="Cadastro" @click="irParaCadastro" />
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
*{
    margin: 0;
    padding: 0;
}
.container {
  display: flex;
  height: 100vh;
  width: 100%;
}
.logo {
  width: 150px;
}
.container .left {
  background-color: var(--color-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  color: var(--color-light);
  justify-content: center;
}
.left h1{
    margin: 0;
    font-weight: bold;
    font-size: 3rem;
}
.left-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 100px 0;
  width: 50%;
  

}
.left-content .left-text {
    display: flex;
    flex-direction: column;
    
}
.container .right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60%;
  background-color: var(--color-light);
  color: var(--color-dark);
}
</style>