<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';
import api from '../services/api';

const router = useRouter();
const freteStore = useFreteStore();

const mostrarModalCarga = ref(false);
const cargaModalDetalhes = ref(null);
const formAtualizacao = ref({});
const localizandoGps = ref({});

onMounted(async () => {
  // Busca estritamente a visão de entregas do motorista
  await freteStore.carregarFretes('motorista');
});

const abrirNoGoogleMaps = (localizacao) => {
  if (!localizacao) return;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localizacao)}`;
  window.open(url, '_blank');
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

const capturarGps = (freteId) => {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
    return;
  }

  localizandoGps.value[freteId] = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const endereco = data.display_name || `${lat}, ${lng}`;
        
        formAtualizacao.value[freteId] = formAtualizacao.value[freteId] || {};
        formAtualizacao.value[freteId].localizacao = endereco;
      } catch {
        formAtualizacao.value[freteId] = formAtualizacao.value[freteId] || {};
        formAtualizacao.value[freteId].localizacao = `${lat}, ${lng}`;
      } finally {
        localizandoGps.value[freteId] = false;
      }
    },
    (error) => {
      console.error("Erro ao obter GPS:", error);
      alert("Não foi possível acessar seu GPS.");
      localizandoGps.value[freteId] = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

const salvarAtualizacaoMotorista = async (freteId) => {
  const dados = formAtualizacao.value[freteId] || {};
  if (!dados.status && !dados.localizacao) {
    alert("Informe um novo status ou localização para atualizar.");
    return;
  }

  const ok = await freteStore.atualizarFreteMotorista(
    freteId, 
    dados.status, 
    dados.localizacao
  );

  if (ok) {
    alert("Frete atualizado com sucesso!");
    formAtualizacao.value[freteId] = { status: '', localizacao: '' };
    await freteStore.carregarFretes('motorista');
  } else {
    alert("Erro ao atualizar o frete.");
  }
};
</script>

<template>
  <div class="hub-container">
    <header class="hub-header">
      <div>
        <h1>Painel do Motorista</h1>
        <p>Acompanhe suas rotas, navegue com Google Maps e atualize seus fretes.</p>
      </div>
      <div class="hub-actions">
        <button class="btn-secondary" @click="router.push('/usuario-hub')">
          ← Voltar para Minhas Encomendas
        </button>
      </div>
    </header>

    <div class="hub-section">
      <section class="hub-card">
        <h2>Entregas em Andamento</h2>
        
        <div v-if="freteStore.loading" class="mini-loader">Carregando entregas...</div>
        <div v-else-if="!freteStore.fretesMotorista || freteStore.fretesMotorista.length === 0" class="empty-state">
          Nenhuma entrega atribuída no momento.
        </div>
        
        <ul v-else class="item-list">
          <li v-for="frete in freteStore.fretesMotorista" :key="frete.id" class="item-row-motorista">
            <div class="frete-info">
              <div class="frete-header-row">
                <span class="badge-id">Frete #{{ frete.id }}</span>
                <span class="status-indicator">{{ frete.status }}</span>
              </div>
              
              <p class="carga-text">
                Carga: 
                <strong class="carga-link" @click="abrirDetalhesCarga(frete.carga)">
                  Ver Detalhes da Carga #{{ frete.carga }}
                </strong>
              </p>

              <div class="localizacao-box">
                <p><strong>Última Localização Registrada:</strong> {{ frete.ultima_localizacao || 'Não informada' }}</p>
                <button 
                  v-if="frete.ultima_localizacao" 
                  class="btn-maps" 
                  @click="abrirNoGoogleMaps(frete.ultima_localizacao)"
                >
                  📍 Abrir no Google Maps
                </button>
              </div>
            </div>

            <!-- Controles do Motorista -->
            <div class="motorista-controles">
              <div class="input-gps-group">
                <input 
                  type="text" 
                  placeholder="Atualizar localização atual (ex: Curitiba - PR)..."
                  v-model="(formAtualizacao[frete.id] = formAtualizacao[frete.id] || {}).localizacao"
                  class="input-sub"
                />
                <button 
                  type="button" 
                  class="btn-gps" 
                  @click="capturarGps(frete.id)"
                  :disabled="localizandoGps[frete.id]"
                >
                  📡 {{ localizandoGps[frete.id] ? 'Obtendo GPS...' : 'Compartilhar Minha Localização Atual' }}
                </button>
              </div>

              <select 
                v-model="(formAtualizacao[frete.id] = formAtualizacao[frete.id] || {}).status"
                class="select-sub"
              >
                <option value="">-- Mudar Status --</option>
                <option value="PENDENTE">PENDENTE</option>
                <option value="EM_TRANSITO">EM_TRANSITO</option>
                <option value="ENTREGUE">ENTREGUE</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
              <button class="btn-primary" @click="salvarAtualizacaoMotorista(frete.id)">
                Atualizar Frete
              </button>
            </div>
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
.hub-container { padding: 30px; max-width: 1000px; margin: 0 auto; font-family: sans-serif; }
.hub-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
.hub-actions { display: flex; gap: 12px; }

.btn-primary { background-color: #4caf50; color: white; padding: 10px 18px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
.btn-secondary { background-color: #2196f3; color: white; padding: 10px 18px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
.btn-gps { background-color: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-gps:disabled { background-color: #aaa; }

.hub-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.hub-card h2 { font-size: 1.3rem; margin: 0 0 20px 0; color: #333; border-left: 4px solid #ff9800; padding-left: 8px; }

.item-list { list-style: none; padding: 0; margin: 0; }
.item-row-motorista { background: #fdfdfd; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }

.frete-header-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.badge-id { background: #eee; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; }
.status-indicator { background-color: #e3f2fd; color: #0d47a1; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }

.carga-text { margin: 8px 0; }
.carga-link { color: #2196f3; cursor: pointer; }
.carga-link:hover { text-decoration: underline; }

.localizacao-box { background: #f5f5f5; padding: 10px; border-radius: 6px; margin: 10px 0; }
.btn-maps { background-color: #4285f4; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 6px; }
.btn-maps:hover { background-color: #3367d6; }

.motorista-controles { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; }
.input-gps-group { display: flex; gap: 8px; flex-wrap: wrap; }
.input-sub { padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; flex: 1; min-width: 200px; }
.select-sub { padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; }

.empty-state, .mini-loader { text-align: center; color: #888; padding: 20px 0; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; padding: 25px; border-radius: 8px; width: 90%; max-width: 500px; }
.details-grid p { margin: 10px 0; }
.foto-detalhe { max-width: 100%; max-height: 220px; border-radius: 4px; display: block; margin: 0 auto; }
.sem-foto-placeholder { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-style: italic; }
.close-btn { margin-top: 20px; width: 100%; padding: 10px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
</style>