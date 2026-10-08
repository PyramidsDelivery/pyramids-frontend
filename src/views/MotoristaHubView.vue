<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';
import api from '../services/api';
import LightButton from '../components/LightButton.vue';
import DarkButton from '../components/DarkButton.vue';
import BaseInput from '../components/BaseInput.vue';
import ModalDetalhesCarga from '../components/ModalDetalhesCarga.vue';
import ModalAceitarFrete from '../components/ModalAceitarFrete.vue';

const router = useRouter();
const freteStore = useFreteStore();
const mostrarModalCarga = ref(false);
const mostrarModalAceite = ref(false);
const cargaSelecionada = ref(null);
const freteSelecionadoParaAceite = ref(null);
const formAtualizacao = ref({});
const localizandoGps = ref({});
const listaCargas = ref([]);

onMounted(async () => {
  await freteStore.carregarFretes('motorista');
  try {
    const res = await api.get('cargas/');
    const data = res.data;
    listaCargas.value = Array.isArray(data) ? data : (data?.results || []);
  } catch (error) {
    console.error("Erro ao carregar cargas:", error);
    listaCargas.value = [];
  }
});

const obterNomeCarga = (idCarga) => {
  const carga = listaCargas.value?.find(c => c.id === idCarga);
  return carga ? carga.descricao : `Carga #${idCarga}`;
};

// Fretes pendentes (aguardando aceitação/recusa)
const fretesPendentes = computed(() => {
  const fretes = freteStore.fretesMotorista || [];
  return fretes.filter(f => f.status === 'PENDENTE');
});

// Fretes em andamento ou aceites
const fretesEmAndamento = computed(() => {
  const fretes = freteStore.fretesMotorista || [];
  return fretes.filter(f => f.status === 'EM_TRANSITO' || f.status === 'ACEITO');
});

const abrirModalAceite = (frete) => {
  freteSelecionadoParaAceite.value = frete;
  mostrarModalAceite.value = true;
};

const responderSolicitacao = async (novoStatus) => {
  if (!freteSelecionadoParaAceite.value) return;
  const freteId = freteSelecionadoParaAceite.value.id;

  const ok = await freteStore.atualizarFreteMotorista(freteId, novoStatus, null);
  if (ok) {
    alert(`Frete ${novoStatus === 'EM_TRANSITO' ? 'aceito' : 'recusado'} com sucesso!`);
    mostrarModalAceite.value = false;
    freteSelecionadoParaAceite.value = null;
    await freteStore.carregarFretes('motorista');
  } else {
    alert("Erro ao atualizar o estado do frete.");
  }
};

const abrirNoGoogleMaps = (localizacao) => {
  if (!localizacao) return;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localizacao)}`;
  window.open(url, '_blank');
};

const abrirDetalhesCarga = async (idCarga) => {
  if (!idCarga) return;
  const cargaLocal = listaCargas.value?.find(c => c.id === idCarga);
  if (cargaLocal) {
    cargaSelecionada.value = cargaLocal;
    mostrarModalCarga.value = true;
    return;
  }
  try {
    await freteStore.buscarDetalheCarga(idCarga);
    cargaSelecionada.value = freteStore.detalheCarga;
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
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const endereco = data.display_name || `${lat},${lng}`; 
        formAtualizacao.value[freteId] = formAtualizacao.value[freteId] || {};
        formAtualizacao.value[freteId].localizacao = endereco;
      } catch {
        formAtualizacao.value[freteId] = formAtualizacao.value[freteId] || {};
        formAtualizacao.value[freteId].localizacao = `${lat},${lng}`;
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
      <div class="header-info">
        <h1>Painel do Motorista</h1>
        <p>Gerencie solicitações, acompanhe rotas e atualize suas entregas.</p>
      </div>
      <div class="hub-actions">
        <LightButton label="← Voltar para Minhas Encomendas" @click="router.push('/usuario-hub')" class="btn-compacto" />
      </div>
    </header>

    <div class="hub-section">
      <!-- SECÇÃO 1: Solicitações Pendentes (Novos Pedidos) -->
      <section class="hub-card" v-if="fretesPendentes.length > 0">
        <h2>Novas Solicitações de Frete (Aguardando Resposta)</h2>
        <ul class="item-list">
          <li v-for="frete in fretesPendentes" :key="frete.id" class="item-row-motorista pending-card">
            <div class="frete-info">
              <div class="frete-header-row">
                <div class="header-left-badges">
                  <span class="badge-id">Frete #{{ frete.id }}</span>
                  <span class="data-criacao" v-if="frete.data_criacao">
                    Solicitado em: {{ new Date(frete.data_criacao).toLocaleDateString('pt-BR') }}
                  </span>
                </div>
                <span class="status-indicator status-pendente">Pendente</span>
              </div>
              <p class="carga-text">
                Carga: 
                <strong class="carga-link" @click="abrirDetalhesCarga(frete.carga)">
                  {{ obterNomeCarga(frete.carga) }}
                </strong>
              </p>
            </div>
            <div class="solicitacao-acoes">
              <DarkButton label="Ver Pedido e Decidir" @click="abrirModalAceite(frete)" class="btn-curtinho" />
            </div>
          </li>
        </ul>
      </section>

      <!-- SECÇÃO 2: Entregas em Andamento -->
      <section class="hub-card" style="margin-top: 25px;">
        <h2>Meu Frete Ativo / Em Andamento</h2>
        <div v-if="freteStore.loading" class="mini-loader">Carregando entregas...</div>
        <div v-else-if="fretesEmAndamento.length === 0" class="empty-state">
          Nenhum frete ativo no momento. Podes receber novas solicitações.
        </div>
        <ul v-else class="item-list">
          <li v-for="frete in fretesEmAndamento" :key="frete.id" class="item-row-motorista">
            <div class="frete-info">
              <div class="frete-header-row">
                <div class="header-left-badges">
                  <span class="badge-id">Frete #{{ frete.id }}</span>
                  <span class="data-criacao" v-if="frete.data_criacao">
                    Criado em: {{ new Date(frete.data_criacao).toLocaleDateString('pt-BR') }}
                  </span>
                </div>
                <span class="status-indicator">{{ frete.status }}</span>
              </div>
              <p class="carga-text">
                Carga: 
                <strong class="carga-link" @click="abrirDetalhesCarga(frete.carga)">
                  {{ obterNomeCarga(frete.carga) }}
                </strong>
              </p>
              <div class="localizacao-box">
                <p><strong>Última Localização Registrada:</strong> {{ frete.ultima_localizacao || 'Não informada' }}</p>
                <DarkButton 
                  v-if="frete.ultima_localizacao" 
                  label="Abrir no Google Maps" 
                  @click="abrirNoGoogleMaps(frete.ultima_localizacao)"
                  class="btn-curtinho"
                />
              </div>
            </div>
            <div class="motorista-controles">
              <div class="input-gps-group">
                <BaseInput 
                  placeholder="Atualizar localização atual (ex: Curitiba - PR)..."
                  v-model="(formAtualizacao[frete.id] = formAtualizacao[frete.id] || {}).localizacao"
                  class="input-sub"
                />
                <DarkButton 
                  :label="localizandoGps[frete.id] ? 'Obtendo GPS...' : 'Compartilhar Minha Localização Atual'"
                  @click="capturarGps(frete.id)"
                  :disabled="localizandoGps[frete.id]"
                  class="btn-curtinho"
                />
              </div>
              <div class="action-bottom-row">
                <select 
                  v-model="(formAtualizacao[frete.id] = formAtualizacao[frete.id] || {}).status"
                  class="select-sub">
                  <option value="">-- Mudar Status --</option>
                  <option value="EM_TRANSITO">EM_TRANSITO</option>
                  <option value="ENTREGUE">ENTREGUE</option>
                </select>
                <DarkButton 
                  label="Atualizar Frete" 
                  @click="salvarAtualizacaoMotorista(frete.id)"
                  class="btn-curtinho"
                />
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <ModalDetalhesCarga 
      v-if="mostrarModalCarga" 
      :isOpen="mostrarModalCarga"
      :carga="cargaSelecionada" 
      @close="mostrarModalCarga = false" 
    />

    <ModalAceitarFrete 
      :isOpen="mostrarModalAceite"
      :frete="freteSelecionadoParaAceite"
      :nomeCarga="freteSelecionadoParaAceite ? obterNomeCarga(freteSelecionadoParaAceite.carga) : ''"
      @close="mostrarModalAceite = false"
      @responder="responderSolicitacao"
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
  width: 100%;
  margin: 0;
}
.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-left: 20px;
  border-left: 5px solid #111;
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
.hub-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
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
.item-row-motorista {
  background: #fafafa;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}
.pending-card {
  border-left: 4px solid #f39c12;
  background: #fffdf9;
}
.frete-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}
.header-left-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.badge-id {
  background: #f1f1f1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #444;
  font-family: monospace;
}
.data-criacao {
  font-size: 0.85rem;
  color: #666;
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
.status-pendente {
  background-color: #fff3cd;
  color: #856404;
}
.carga-text {
  margin: 10px 0;
  font-size: 0.95rem;
  color: #444;
}
.carga-link {
  color: #0d47a1;
  cursor: pointer;
}
.carga-link:hover {
  text-decoration: underline;
}
.solicitacao-acoes {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}
.localizacao-box {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
  border: 1px solid #e5e5e5;
  font-size: 0.9rem;
}
.motorista-controles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}
.input-gps-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.input-sub {
  flex: 1;
  min-width: 220px;
}
.action-bottom-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.select-sub {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
  flex: 1;
  min-width: 160px;
}
.empty-state, .mini-loader {
  text-align: center;
  color: #888;
  padding: 30px 0;
  font-style: italic;
}
</style>