<script setup>
import { useRouter } from 'vue-router'
import logo from '../assets/logo.png'
import LightButton from '../components/LightButton.vue'
import DarkButton from '../components/DarkButton.vue'

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
     <div class="right-content">
     <div class="right-text">
        <h1>Bem-vindo de volta!</h1>
        <p>Acesse sua conta agora mesmo.</p>
      </div>

     <div class="inputs">
        <input type="text" placeholder="Nome" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Senha" />
      </div>

      <DarkButton label="Entrar" />
     </div>
    </div>
  </div>
</template>

<style scoped>
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
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
    line-height: 3rem;
    font-size: 3rem;
}
.left p{
    font-size: 1.2rem;
    color: var(--color-light);
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
    gap: 10px;
    
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
.right-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 60%;
  padding: 100px 0;
}

.right-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
.right h1{
    font-weight: bold;
    line-height: 3rem;
    font-size: 3rem;
}
.right p{
    font-size: 1.2rem;
    color: var(--color-dark);
}
.right input {
  background-color: var(--color-input-bg);
  color: var(--color-input-txt);
  width: 100%;
  padding: 12px 10px;
  margin: 10px 0;
  border: 2px solid var(--color-light);
  border-radius: 16px;
  transition: border-color 0.3s ease;
}
.right input:focus {
  border-color: var(--color-dark);
  border: 2px solid var(--color-dark);
  outline: none;
}
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--color-input-bg) inset;
  -webkit-text-fill-color: var(--color-input-txt);
}
</style>