<script setup>
import { ref } from 'vue' // Adicionado
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/useDataStore' // Adicionado
import logo from '../assets/logo.png'
import LightButton from '../components/LightButton.vue'
import DarkButton from '../components/DarkButton.vue'
import BaseInput from '../components/BaseInput.vue'

const router = useRouter()
const store = useDataStore()

const email = ref('')
const senha = ref('')

async function realizarLogin() {
  const sucesso = await store.login(email.value, senha.value)
  if (sucesso) {
    router.push('/fretesadm')
  } else {
    alert('Falha no login. Verifique suas credenciais.')
  }
}

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
         
          <BaseInput v-model="email" type="email" placeholder="Email" />
          <BaseInput v-model="senha" type="password" placeholder="Senha" />
        </div>

        <DarkButton label="Entrar" @click="realizarLogin" />
      </div>
    </div>
  </div>
  <div class="mobile">
    <div class="top">
      <img :src="logo" alt="Logo" />
    </div>

    <div class="mobile-content">
      <div class="right-text">
        <h1>Bem-vindo de volta!</h1>
        <p>Acesse sua conta agora mesmo.</p>
      </div>

      <div class="inputs">
        <BaseInput placeholder="Nome" />
        <BaseInput type="email" placeholder="Email" />
        <BaseInput type="password" placeholder="Senha" />
      </div>

      <DarkButton label="Entrar" />
      <p class="mobile-link">
        <span @click="irParaCadastro"> Não tem uma conta? Cadastre-se.</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
* {
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

.left h1 {
  margin: 0;
  font-weight: bold;
  line-height: 3rem;
  font-size: 3rem;
}

.left p {
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

.right h1 {
  font-weight: bold;
  line-height: 3rem;
  font-size: 3rem;
}

.right p {
  font-size: 1.2rem;
  color: var(--color-dark);
}

.right .inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}


@media (min-width: 1440px) {
  .container {
    max-width: 2000px;
    margin: 0 auto;
  }

  .left-content,
  .right-content {
    padding: 200px 0;
    max-width: 700px;
  }

  .left h1,
  .right h1 {
    font-size: 3.2rem;
  }

  .right p,
  .left p {
    font-size: 1.4rem;
  }

  .right input {
    margin-top: 20px;
    padding: 14px 18px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    height: auto;
  }

  .left {
    display: none;
  }

  .right {
    width: 100%;
    min-height: 100vh;
  }

  .right-content {
    width: 90%;
    padding: 40px 0;
    gap: 30px;
  }

  .right h1 {
    font-size: 2rem;
    text-align: center;
  }

  .right p {
    font-size: 1rem;
    text-align: center;
  }

  .right input {
    padding: 14px;
    font-size: 16px;
  }
}

.mobile {
  display: none;
}

@media (max-width: 768px) {

  .container {
    display: none;
    /* esconde desktop */
  }

  .mobile {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #e9e9e9;
  }

  .mobile .right-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .mobile .right-text h1 {
    font-size: 2rem;
    text-align: center;
  }

  .mobile .right-text p {
    font-size: 1rem;
    text-align: center;
    font-weight: 500;
  }

  .top {
    height: 180px;
    background: var(--color-dark);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .top img {
    width: 120px;
  }

  .mobile-content {
    flex: 1;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    gap: 50px;

  }
.mobile .right-text {
    margin-bottom: 10px;
  }
  .mobile .inputs {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }
 .mobile input {
    background: #dcdcdc;
    border: 2px solid var(--color-input-bg);
    border-radius: 20px;
    padding: 16px 14px;
    width: 100%;
  } 

.mobile input:focus {
  border-color: var(--color-dark);
  outline: none;
  color: var(--color-dark);
}

  /* joga o link pro final */
  .mobile-link {
    margin-top: auto;
    text-align: center;
    font-size: 1rem;
  }

  .mobile-link span {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
