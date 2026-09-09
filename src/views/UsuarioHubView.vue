<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';
import api from '../services/api';

const router = useRouter();
const freteStore = useFreteStore();

const listaCargasUser = ref([]);
const loadingCargas = ref(true);

const mostrarModalCarga = ref(false);
const cargaModalDetalhes = ref(null);

onMounted(async () => {
  // 🔥 Busca exclusivamente os fretes solicitados pelo cliente
  await freteStore.carregarFretes('cliente');

  try {
    const response = await api.get('cargas/');
    if (Array.isArray(response.data)) {
      listaCargasUser.value = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      listaCargasUser.value = response.data.results;
    } else {
      listaCargasUser.value = [];
    }
  } catch (error) {
    console.error("Erro ao carregar cargas do usuário:", error);
    listaCargasUser.value = [];
  } finally {
    loadingCargas.value = false;
  }
});

// 🔥 Lê diretamente do estado exclusivo de fretes encomendados
const meusFretes = computed(() => freteStore.fretesCliente || []);

const getNomeCarga = (idCarga) => {
  if (!listaCargasUser.value || !Array.isArray(listaCargasUser.value)) {
    return `Carga #${idCarga}`;
  }
  const cargaEncontrada = listaCargasUser.value.find(c => c.id === idCarga);
  return cargaEncontrada ? cargaEncontrada.descricao : `Carga #${idCarga}`;
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
      <div>
        <h1>Meu Painel de Encomendas</h1>
        <p>Acompanhe e gerencie as suas solicitações de frete e cargas cadastradas.</p>
      </div>
      <div class="hub-actions">
        <button class="btn-warning" @click="router.push('/motorista-hub')">
          🚚 Ir para Área do Motorista
        </button>
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
          <li 
            v-for="carga in listaCargasUser" 
            :key="carga.id" 
            class="item-row clickable-row"
            @click="abrirDetalhesCarga(carga.id)"
          >
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
        <div v-else-if="meusFretes.length === 0" class="empty-state">
          Nenhum pedido de frete em andamento.
        </div>
        <ul v-else class="item-list">
          <li v-for="frete in meusFretes" :key="frete.id" class="item-row">
            <div>
              <span class="badge-id">#{{ frete.id }}</span>
              <span>Carga: 
                <strong class="carga-link" @click="abrirDetalhesCarga(frete.carga)">
                  {{ getNomeCarga(frete.carga) }}
                </strong>
              </span>
            </div>
            <span class="status-indicator">{{ frete.status }}</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- MODAL DE DETALHES DA CARGA -->
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
            :src="cargaModalDetalhes.foto_url.startsWith('http') 
                  ? cargaModalDetalhes.foto_url 
                  : 'http://localhost:8000' + cargaModalDetalhes.foto_url" 
            alt="Foto da Carga" 
            class="foto-detalhe"
          />
          <div v-else class="sem-foto-placeholder">
            <span>Nenhuma foto cadastrada</span>
          </div>
        </div>

        <button class="close-btn" @click="mostrarModalCarga = false">Fechar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hub-container { padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; }
.hub-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
.hub-actions { display: flex; gap: 12px; }

.btn-primary { background-color: #4caf50; color: white; padding: 10px 18px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
.btn-secondary { background-color: #2196f3; color: white; padding: 10px 18px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
.btn-warning { background-color: #ff9800; color: white; padding: 10px 18px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }

.hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
@media (max-width: 768px) { .hub-grid { grid-template-columns: 1fr; } }

.hub-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.hub-card h2 { font-size: 1.3rem; margin: 0 0 20px 0; color: #333; border-left: 4px solid #2196f3; padding-left: 8px; }

.item-list { list-style: none; padding: 0; margin: 0; }
.item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-bottom: 1px solid #f0f0f0; }

.clickable-row { cursor: pointer; transition: background 0.2s ease; }
.clickable-row:hover { background-color: #f9f9f9; }
.carga-link { color: #2196f3; cursor: pointer; }
.carga-link:hover { text-decoration: underline; }

.badge-id { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-right: 8px; color: #666; }
.empty-state, .mini-loader { text-align: center; color: #888; padding: 30px 0; font-style: italic; }
.text-muted { color: #777; font-size: 0.9rem; }
.status-indicator { background-color: #e3f2fd; color: #0d47a1; padding: 4px 8px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; padding: 25px; border-radius: 8px; width: 90%; max-width: 500px; }
.details-grid p { margin: 10px 0; font-size: 1rem; }
.foto-detalhe { max-width: 100%; max-height: 220px; border-radius: 4px; display: block; margin: 0 auto; }
.sem-foto-placeholder { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-style: italic; }
.close-btn { margin-top: 20px; width: 100%; padding: 10px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
</style>