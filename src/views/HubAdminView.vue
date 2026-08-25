<script setup>
import {useRouter} from 'vue-router' 
import LightButton from '../components/LightButton.vue';

const router = useRouter()

function verFretes() {
    router.push('/fretesadm')
}
function verUsuarios() {
    router.push('/usuarioslist')
}
</script>

<template>
  <div class="hub-container">
    <div class="hub-header">
      <h1>Painel de Controle</h1>
      <p>Selecione uma seção para continuar</p>
    </div>

    <div class="hub-grid">
      <div class="hub-card" @click="verFretes">
        <span class="hub-card-label">Gestão</span>
        <h2>Fretes</h2>
        <LightButton @click.stop="verFretes" label="Acessar"></LightButton>
      </div>

      <div class="hub-card" @click="verUsuarios">
        <span class="hub-card-label">Gestão</span>
        <h2>Usuários</h2>
        <LightButton @click.stop="verUsuarios" label="Acessar"></LightButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hub-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3.5rem;
  padding: 2rem;
  background: #f2f2f2;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.hub-header {
  text-align: center;
  color: #141414;
}

.hub-header h1 {
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.hub-header p {
  margin-top: 0.5rem;
  color: #6b6b6b;
  font-size: 1rem;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 640px;
}

.hub-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.hub-card:hover {
  transform: translateY(-4px);
  border-color: #141414;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.hub-card-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9a9a9a;
}

.hub-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #141414;
  margin: 0 0 0.5rem 0;
}
</style>