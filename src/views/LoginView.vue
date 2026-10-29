<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDataStore } from "../stores/useDataStore";
import LightButton from "../components/LightButton.vue";
import DarkButton from "../components/DarkButton.vue";
import BaseInput from "../components/BaseInput.vue";
import PiramideAnimada from "../components/PiramideAnimada.vue";

const router = useRouter();
const store = useDataStore();

const email = ref("");
const senha = ref("");

async function realizarLogin() {
  const sucesso = await store.login(email.value, senha.value);

  if (!sucesso) {
    alert("Falha no login. Verifique suas credenciais.");
    return;
  }

  router.push(
    store.isStaff || store.isSuperuser ? "/hubadmin" : "/usuario-hub",
  );
}

function irParaCadastro() {
  router.push("/cadastro");
}
</script>

<template>
  <div class="container">
    <div class="left">
      <div class="left-content">
        <PiramideAnimada :size="260" />

        <!-- Escondido no mobile -->
        <div class="left-extra">
          <div class="left-text">
            <h1>Não tem uma conta?</h1>
            <p>Cadastre-se.</p>
          </div>
          <LightButton label="Cadastro" @click="irParaCadastro" />
        </div>
      </div>
    </div>

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

        <!-- Aparece só no mobile -->
        <p class="mobile-link">
          <span @click="irParaCadastro">Não tem uma conta? Cadastre-se.</span>
        </p>
      </div>
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

/* ---------- Lado esquerdo ---------- */
.left {
  background-color: var(--color-dark);
  color: var(--color-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40%;
}

.left-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  width: 75%;
  max-width: 480px;
  padding: 30px 20px;
}

.left-extra {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.left-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.left h1 {
  font-size: 2.4rem;
  line-height: 2.6rem;
  font-weight: bold;
}

.left p {
  font-size: 1.1rem;
}

/* ---------- Lado direito ---------- */
.right {
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
  text-align: center;
}

.right h1 {
  font-size: 3rem;
  line-height: 3rem;
  font-weight: bold;
}

.right p {
  font-size: 1.2rem;
}

.inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.mobile-link {
  display: none;
}

/* ---------- Telas grandes ---------- */
@media (min-width: 1440px) {
  .container {
    max-width: 2000px;
    margin: 0 auto;
  }

  .right-content {
    padding: 140px 0;
    max-width: 700px;
  }

  .left h1,
  .right h1 {
    font-size: 3.2rem;
  }

  .left p,
  .right p {
    font-size: 1.4rem;
  }
}

/* ---------- Mobile ---------- */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    background: #e9e9e9;
  }

  .left {
    width: 100%;
    height: 180px;
  }

  .left-content {
    height: auto;
    padding: 0;
  }

  .left-extra {
    display: none;
  }

  /* Reduz a pirâmide para caber na faixa escura */
  .left-content :deep(.piramide-animada) {
    width: 200px !important;
    height: 160px !important;
  }

  .right {
    flex: 1;
    width: 100%;
    background: #e9e9e9;
  }

  .right-content {
    flex: 1;
    height: auto;
    width: 100%;
    justify-content: flex-start;
    gap: 45px;
    padding: 45px 20px;
  }

  .right h1 {
    font-size: 2rem;
  }

  .right p {
    font-size: 1rem;
    font-weight: 500;
  }

  .inputs {
    gap: 25px;
  }

  .mobile-link {
    display: block;
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
