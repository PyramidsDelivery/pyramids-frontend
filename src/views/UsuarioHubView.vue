<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';
import api from '../services/api';

const router = useRouter();
const freteStore = useFreteStore();

const listaCargasUser = ref([]);
const loadingCargas = ref(true);

onMounted(async () => {
  // 1. Carrega os fretes vinculados a este usuário
  await freteStore.carregarFretes();

  // 2. Carrega as cargas vinculadas a este usuário diretamente da API
  try {
    const response = await api.get('cargas/');
    listaCargasUser.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar as cargas do usuário:", error);
  } finally {
    loadingCargas.value = false;
  }
});

const meusFretes = computed(() => freteStore.listaFretes || []);
</script>

<template>
  <div class="hub-container">
    <header class="hub-header">
      <div>
        <h1>Meu Painel de Entregas</h1>
        <p>Acompanhe e gerencie as suas solicitações de frete e cargas cadastradas.</p>
      </div>
      <div class="hub-actions">
        <button class="btn-primary" @click="router.push('/cargas/novo')">
          + Cadastrar Carga
        </button>
        <button class="btn-secondary" @click="router.push('/fretes/novo')">
          + Solicitar Frete
        </button>
      </div>
    </header>

    <div class="hub-grid">
      <section class="hub-card">
        <h2>Minhas Cargas Cadastradas</h2>
        <div v-if="loadingCargas" class="mini-loader">Carregando cargas...</div>
        <div v-else-if="listaCargasUser.length === 0" class="empty-state">
          Você ainda não cadastrou nenhuma carga.
        </div>
        <ul v-else class="item-list">
          <li v-for="carga in listaCargasUser" :key="carga.id" class="item-row">
            <div>
              <span class="badge-id">#{{ carga.id }}</span>
              <strong>{{ carga.descricao }}</strong>
            </div>
            <span class="text-muted">{{ carga.peso }} {{ carga.unidade }}</span>
          </li>
        </ul>
      </section>

      <section class="hub-card">
        <h2>Meus Fretes Solicitados</h2>
        <div v-if="freteStore.loading" class="mini-loader">Carregando fretes...</div>
        <div v-else-if="meusFretes.length === 0" class="empty-state">
          Nenhum pedido de frete em andamento.
        </div>
        <ul v-else class="item-list">
          <li v-for="frete in meusFretes" :key="frete.id" class="item-row">
            <div>
              <span class="badge-id">#{{ frete.id }}</span>
              <span>Carga associada: <strong>#{{ frete.carga }}</strong></span>
            </div>
            <span class="status-indicator">{{ frete.status }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hub-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: sans-serif;
}
.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 30px;
}
.hub-actions {
  display: flex;
  gap: 12px;
}
.btn-primary, .btn-secondary {
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.btn-primary { background-color: #4caf50; color: white; }
.btn-secondary { background-color: #2196f3; color: white; }

.hub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}
@media (max-width: 768px) {
  .hub-grid { grid-template-columns: 1fr; }
}
.hub-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.hub-card h2 {
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-left: 4px solid #2196f3;
  padding-left: 8px;
}
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid #f0f0f0;
}
.item-row:last-child { border-bottom: none; }
.badge-id {
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 8px;
  color: #666;
}
.empty-state {
  text-align: center;
  color: #888;
  padding: 30px 0;
  font-style: italic;
}
.mini-loader { text-align: center; color: #666; }
.text-muted { color: #777; font-size: 0.9rem; }
.status-indicator {
  background-color: #e3f2fd;
  color: #0d47a1;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}
</style>