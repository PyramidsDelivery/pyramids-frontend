<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';
import api from '../services/api';
import DarkButton from '../components/DarkButton.vue';
import ModalCriarFreteCompleto from '../components/ModalCriarFreteCompleto.vue';

const router = useRouter();
const freteStore = useFreteStore();
const listaCargasUser = ref([]);
const loadingCargas = ref(true);
const mostrarModalCarga = ref(false);
const cargaModalDetalhes = ref(null);

const mostrarModalFreteCompleto = ref(false);

const carregarDadosUsuario = async () => {
  await freteStore.carregarFretes('cliente');
  try {
    const res = await api.get('cargas/');
    const data = res.data;
    listaCargasUser.value = Array.isArray(data) ? data : (data?.results || []);
  } catch (error) {
    console.error("Erro ao carregar cargas do usuário:", error);
    listaCargasUser.value = [];
  } finally {
    loadingCargas.value = false;
  }
};

onMounted(carregarDadosUsuario);

const meusFretes = computed(() => freteStore.fretesCliente || []);

const getNurmeCarga = (idCarga) => {
  const carga = listaCargasUser.value?.find(c => c.id === idCarga);
  return carga ? carga.descricao : `Carga #${idCarga}`;
};

const abrirDetalhesCarga = async (idCarga) => {
  if (!idCarga) return;
  try {
    const res = await api.get(`cargas/${idCarga}/`);
    cargaModalDetalhes.value = res.data;
    mostrarModalCarga.value = true;
  } catch (error) {
    console.error("Erro ao buscar detalhes da carga:", error);
    alert("Erro ao carregar os detalhes desta carga.");
  }
};
</script>

<template>
  <div class="hub-container">
    <header class="hub-header">
      <div class="header-info">
        <h1>Meu Painel de Encomendas</h1>
        <p>Acompanhe e gerencie as suas solicitações de frete e cargas cadastradas.</p>
      </div>
      <div class="hub-actions">
        <DarkButton label="Solicitar Frete" @click="mostrarModalFreteCompleto = true" class="btn-compacto" />
      </div>
    </header>

    <div class="hub-grid">
      <section class="hub-card">
        <h2>Minhas Cargas Cadastradas</h2>
        <div v-if="loadingCargas" class="mini-loader">Carregando cargas...</div>
        <div v-else-if="!listaCargasUser.length" class="empty-state">Você ainda não cadastrou nenhuma carga.</div>
        <ul v-else class="item-list">
          <li v-for="carga in listaCargasUser" :key="carga.id" class="item-row clickable-row" @click="abrirDetalhesCarga(carga.id)">
            <div>
              <span class="badge-id">#{{ carga.id }}</span>
              <strong>{{ carga.descricao }}</strong>
            </div>
            <span class="text-muted">{{ carga.peso }} {{ carga.unidade }}</span>
          </li>
        </ul>
      </section>

      <section class="hub-card">
        <h2>Meus Fretes Encomendados</h2>
        <div v-if="freteStore.loading" class="mini-loader">Carregando fretes...</div>
        <div v-else-if="!meusFretes.length" class="empty-state">Nenhum pedido de frete em andamento.</div>
        <ul v-else class="item-list">
          <li v-for="frete in meusFretes" :key="frete.id" class="item-row">
            <div>
              <span class="badge-id">#{{ frete.id }}</span>
              <span>Carga: <strong class="carga-link" @click="abrirDetalhesCarga(frete.carga)">{{ getNurmeCarga(frete.carga) }}</strong></span>
            </div>
            <span class="status-indicator">{{ frete.status }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div v-if="mostrarModalCarga" class="modal-overlay" @click.self="mostrarModalCarga = false">
      <div class="modal-content">
        <h3>Detalhes da Carga #{{ cargaModalDetalhes?.id }}</h3>
        <hr /> 
        <div v-if="cargaModalDetalhes" class="details-grid">
          <p><strong>Descrição:</strong> {{ cargaModalDetalhes.descricao }}</p>
          <p><strong>Peso:</strong> {{ cargaModalDetalhes.peso }} {{ cargaModalDetalhes.unidade || 'kg' }}</p>
          <p><strong>Valor:</strong> R$ {{ cargaModalDetalhes.valor || '0.00' }}</p>
        </div>
        <div v-if="cargaModalDetalhes" class="foto-produto-container">
          <label class="foto-label"><strong>Foto do Produto:</strong></label>
          <img 
            v-if="cargaModalDetalhes.foto_url" 
            :src="cargaModalDetalhes.foto_url.startsWith('http') ? cargaModalDetalhes.foto_url : 'http://localhost:8000' + cargaModalDetalhes.foto_url" 
            alt="Foto da Carga" 
            class="foto-detalhe"
          />
          <div v-else class="sem-foto-placeholder">Nenhuma foto cadastrada</div>
        </div>
        <button class="close-btn" @click="mostrarModalCarga = false">Fechar</button>
      </div>
    </div>

    <ModalCriarFreteCompleto
      :isOpen="mostrarModalFreteCompleto"
      @close="() => { mostrarModalFreteCompleto = false; carregarDadosUsuario(); }"
    />
  </div>
</template>

<style scoped>
.hub-container {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 40px;
  background: #f5f5f5;
  font-family: 'Inter', sans-serif;
  color: #1a1a1a;
  max-width: 1400px;
  margin: 0 auto;
}
.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-left: 20px;
  border-left: 5px solid #111;
  background: transparent;
  border-bottom: none;
  padding-bottom: 0;
}
.header-info h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1px;
  text-transform: uppercase;
}
.header-info p {
  margin-top: 6px;
  color: #666;
  font-size: 1rem;
}
.hub-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
}
.btn-compacto {
  display: inline-block !important;
  width: auto !important;
}
.btn-compacto :deep(button),
.btn-compacto :deep(.dark-button),
.btn-compacto :deep(.light-button),
.btn-compacto :deep(a) {
  width: auto !important;
  display: inline-block !important;
  padding: 8px 16px !important;
  font-size: 0.85rem !important;
  min-height: auto !important;
  height: auto !important;
  white-space: nowrap !important;
}
.hub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}
@media (max-width: 900px) {
  .hub-grid {
    grid-template-columns: 1fr;
  }
  .hub-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .hub-actions {
    flex-wrap: wrap;
    width: 100%;
  }
}
.hub-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: none;
}
.hub-card h2 {
  font-size: 1.1rem;
  margin: 0 0 20px 0;
  color: #111;
  border-left: 4px solid #111;
  padding-left: 8px;
  text-transform: uppercase;
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
  padding: 14px 10px;
  border-bottom: 1px solid #ececec;
}
.clickable-row {
  cursor: pointer;
  transition: background 0.2s ease;
}
.clickable-row:hover {
  background-color: #fafafa;
}
.carga-link {
  color: #0d47a1;
  cursor: pointer;
}
.carga-link:hover {
  text-decoration: underline;
}
.badge-id {
  background: #f1f1f1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-right: 8px;
  color: #444;
  font-family: monospace;
}
.empty-state, .mini-loader {
  text-align: center;
  color: #888;
  padding: 30px 0;
  font-style: italic;
}
.text-muted {
  color: #777;
  font-size: 0.9rem;
}
.status-indicator {
  background-color: #e3f2fd;
  color: #0d47a1;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.details-grid p {
  margin: 10px 0;
  font-size: 0.95rem;
  color: #444;
}
.foto-detalhe {
  max-width: 100%;
  max-height: 220px;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}
.sem-foto-placeholder {
  background: #f5f5f5;
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
  border-radius: 8px;
}
.close-btn {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background: #111;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
</style>