<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';
import api from '../services/api';
import DarkButton from '../components/DarkButton.vue';
import LightButton from '../components/LightButton.vue';
import BarraFiltrosFretes from '../components/BarraFiltrosFretes.vue';
import ModalDetalhesCarga from '../components/ModalDetalhesCarga.vue';
import ModalDetalhesMotorista from '../components/ModalDetalhesMotorista.vue';
import ModalCriarFreteCompleto from '../components/ModalCriarFreteCompleto.vue';

const router = useRouter();
const freteStore = useFreteStore();
const listaCargasUser = ref([]);

const mostrarModalCarga = ref(false);
const mostrarModalMotorista = ref(false);
const mostrarModalFreteCompleto = ref(false);

// Estados da barra de filtros unificada
const buscaCarga = ref('');
const filtroPrecoMax = ref('');
const filtroData = ref('');

const carregarDadosUsuario = async () => {
  await Promise.all([
    freteStore.carregarFretes('cliente'),
    freteStore.buscarOpcoesCadastro()
  ]);
  try {
    const res = await api.get('cargas/');
    const data = res.data;
    listaCargasUser.value = Array.isArray(data) ? data : (data?.results || []);
  } catch (error) {
    console.error("Erro ao carregar cargas do usuário:", error);
    listaCargasUser.value = [];
  }
};

onMounted(carregarDadosUsuario);

const meusFretes = computed(() => freteStore.fretesCliente || []);

const obterDescricaoCarga = (id) => {
  const carga = listaCargasUser.value?.find(c => c.id === id);
  return carga ? carga.descricao : `Carga #${id}`;
};

const obterNomeMotorista = (id) =>
  freteStore.opcoes?.motoristas?.find((m) => m.id === id)?.nome ||
  (id ? `Motorista #${id}` : 'Não atribuído');

// Filtro aplicado aos fretes encomendados
const fretesFiltrados = computed(() => {
  return meusFretes.value.filter((frete) => {
    const descricaoCarga = obterDescricaoCarga(frete.carga).toLowerCase();
    
    if (buscaCarga.value && !descricaoCarga.includes(buscaCarga.value.toLowerCase())) {
      return false;
    }
    if (filtroPrecoMax.value && parseFloat(frete.valor_frete || 0) > parseFloat(filtroPrecoMax.value)) {
      return false;
    }
    if (filtroData.value && frete.data_criacao) {
      const dataFrete = frete.data_criacao.split('T')[0];
      if (dataFrete !== filtroData.value) return false;
    }
    return true;
  });
});

const getStatusClass = (s) =>
  `status-${s?.toLowerCase().replace(/\s+/g, "-") || "default"}`;

const abrirCarga = async (id) => {
  await freteStore.buscarDetalheCarga(id);
  mostrarModalCarga.value = true;
};

const abrirMotorista = async (id) => {
  if (!id) return;
  await freteStore.buscarDetalheMotorista(id);
  mostrarModalMotorista.value = true;
};

function fazerLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.clear();
  router.push('/');
}
</script>

<template>
  <div class="usuario-container">
    <!-- Botão de Sair isolado no canto superior direito absoluto da página -->
    <div class="logout-top-corner">
      <DarkButton label="Sair" @click="fazerLogout" />
    </div>

    <header class="usuario-header">
      <div>
        <h1>Meu Painel de Encomendas</h1>
        <p>Acompanhe e gerencie as suas solicitações de frete.</p>
      </div>
      <div class="header-btns">
        <LightButton label="Área do Motorista" @click="router.push('/motorista-hub')" />
        <DarkButton label="Solicitar Frete" @click="mostrarModalFreteCompleto = true" />
      </div>
    </header>

    <!-- Barra de Filtros Unificada com o design do Admin -->
    <BarraFiltrosFretes
      v-model:buscaCarga="buscaCarga"
      v-model:filtroPrecoMax="filtroPrecoMax"
      v-model:filtroData="filtroData"
      :isAdmin="false"
      @limpar="
        buscaCarga = '';
        filtroPrecoMax = '';
        filtroData = '';
      "
    />

    <!-- Secção de Fretes Encomendados -->
    <div class="section-container">
      <h2>Meus Fretes Encomendados</h2>
      <div v-if="freteStore.loading" class="loader-container">
        <div class="loader"></div>
      </div>
      <div v-else-if="!fretesFiltrados.length" class="empty-results">Nenhum pedido de frete encontrado.</div>
      <div v-else class="table-wrapper">
        <table class="fretes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Carga</th>
              <th>Motorista</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in fretesFiltrados" :key="f.id">
              <td>#{{ f.id }}</td>
              <td class="clickable" @click="abrirCarga(f.carga)">
                {{ obterDescricaoCarga(f.carga) }}
              </td>
              <td class="clickable" @click="abrirMotorista(f.motorista)">
                {{ obterNomeMotorista(f.motorista) }}
              </td>
              <td>{{ f.valor_frete }} {{ f.moeda || 'Reais' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(f.status)]">
                  {{ f.status }}
                </span>
              </td>
              <td>{{ f.data_criacao ? new Date(f.data_criacao).toLocaleDateString('pt-BR') : '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modais -->
    <ModalDetalhesCarga
      v-if="mostrarModalCarga"
      :isOpen="mostrarModalCarga"
      :carga="freteStore.detalheCarga"
      @close="mostrarModalCarga = false"
    />
    <ModalDetalhesMotorista
      v-if="mostrarModalMotorista"
      :isOpen="mostrarModalMotorista"
      :motorista="freteStore.detalheMotorista"
      @close="mostrarModalMotorista = false"
    />
    <ModalCriarFreteCompleto
      v-if="mostrarModalFreteCompleto"
      :isOpen="mostrarModalFreteCompleto"
      @close="() => { mostrarModalFreteCompleto = false; carregarDadosUsuario(); }"
    />
  </div>
</template>

<style scoped>
.usuario-container {
  padding: 40px;
  background: #f2f2f2;
  min-height: 100vh;
  font-family: sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  position: relative; /* Mantém o posicionamento absoluto relativo a esta view */
}

.logout-top-corner {
  position: absolute;
  top: 20px;
  right: 40px;
}

.logout-top-corner :deep(button) {
  padding: 5px 12px;
  font-size: 0.75rem;
  border-radius: 6px;
}

.usuario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px; /* Garante que o header desça um pouco para não bater no botão de sair */
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 20px;
}
.usuario-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  text-transform: uppercase;
}
.usuario-header p {
  margin-top: 6px;
  color: #666;
}
.header-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.header-btns :deep(button) {
  width: auto;
  padding: 8px 14px;
  font-size: 0.85rem;
  border-radius: 8px;
}
.section-container {
  margin-bottom: 35px;
}
.section-container h2 {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #111;
  border-left: 4px solid #111;
  padding-left: 8px;
  text-transform: uppercase;
}
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
}
.fretes-table {
  width: 100%;
  border-collapse: collapse;
}
.fretes-table th {
  padding: 16px;
  background: #141414;
  color: #fff;
  text-align: left;
  font-size: 0.78rem;
  text-transform: uppercase;
}
.fretes-table td {
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}
.clickable {
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #e3f2fd;
  color: #0d47a1;
}
.empty-results {
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 14px;
  color: #6b6b6b;
}
.loader-container {
  display: flex;
  justify-content: center;
  padding: 30px;
  color: #666;
}
.loader {
  width: 36px;
  height: 36px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #141414;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>