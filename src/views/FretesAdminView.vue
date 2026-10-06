<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useFreteStore } from "../stores/freteStore";
import api from "../services/api";

import DarkButton from "../components/DarkButton.vue";
import LightButton from "../components/LightButton.vue";
import ModalNovaRota from "../components/ModalNovaRota.vue";
import ModalDetalhesCarga from "../components/ModalDetalhesCarga.vue";
import ModalDetalhesMotorista from "../components/ModalDetalhesMotorista.vue";
import ModalEditarCarga from "../components/ModalEditarCarga.vue";
import ModalEditarFrete from "../components/ModalEditarFrete.vue";
import ModalCriarFreteCompleto from "../components/ModalCriarFreteCompleto.vue";

const router = useRouter();
const freteStore = useFreteStore();

const mostrarModalCarga = ref(false);
const mostrarModalMotorista = ref(false);
const mostrarModalEditar = ref(false);
const mostrarModalEditarCarga = ref(false);
const mostrarModalRota = ref(false);
const mostrarModalFreteCompleto = ref(false);

const filtroPrecoMax = ref("");
const filtroUsuario = ref("");
const buscaCarga = ref("");

const freteSelecionado = ref({});
const cargaSelecionada = ref({});

const carregarDadosDoPainel = async () => {
  await Promise.all([
    freteStore.carregarFretes(),
    freteStore.buscarOpcoesCadastro(),
  ]);
};

onMounted(carregarDadosDoPainel);

const listaFretes = computed(() =>
  Array.isArray(freteStore.listaFretes)
    ? freteStore.listaFretes
    : freteStore.listaFretes?.results || [],
);
const listaUsuariosUnicos = computed(() =>
  [
    ...new Set(listaFretes.value.map((f) => f.usuario_email).filter(Boolean)),
  ].sort(),
);

const obterDescricaoCarga = (id) =>
  freteStore.opcoes?.cargas?.find((c) => c.id === id)?.descricao ||
  `Carga #${id}`;
const obterNomeMotorista = (id) =>
  freteStore.opcoes?.motoristas?.find((m) => m.id === id)?.nome ||
  `Motorista #${id}`;

const fretesFiltrados = computed(() =>
  listaFretes.value.filter((f) => {
    if (
      filtroPrecoMax.value &&
      parseFloat(f.valor_frete) > parseFloat(filtroPrecoMax.value)
    )
      return false;
    if (filtroUsuario.value && f.usuario_email !== filtroUsuario.value)
      return false;
    if (
      buscaCarga.value &&
      !obterDescricaoCarga(f.carga)
        .toLowerCase()
        .includes(buscaCarga.value.toLowerCase())
    )
      return false;
    return true;
  }),
);

const getStatusClass = (s) =>
  `status-${s?.toLowerCase().replace(/\s+/g, "-") || "default"}`;

const abrirCarga = async (id) => {
  await freteStore.buscarDetalheCarga(id);
  mostrarModalCarga.value = true;
};
const abrirMotorista = async (id) => {
  await freteStore.buscarDetalheMotorista(id);
  mostrarModalMotorista.value = true;
};

const prepararEdicao = (frete) => {
  freteSelecionado.value = { ...frete };
  mostrarModalEditar.value = true;
};
const prepararEdicaoCarga = (id) => {
  const c = freteStore.opcoes?.cargas?.find((item) => item.id === id);
  if (c) {
    cargaSelecionada.value = { ...c };
    mostrarModalEditarCarga.value = true;
  }
};

const excluirFrete = async (id) => {
  if (confirm(`Excluir Frete #${id}?`)) {
    await api.delete(`fretes/${id}/`);
    await carregarDadosDoPainel();
  }
};
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <div>
        <h1>Administração de Fretes</h1>
        <p>Gerencie cargas e acompanhe os status em tempo real.</p>
      </div>
      <div class="header-btns">
        <!-- ➔ Apenas o botão unificado e o botão de voltar -->
        <DarkButton label="Criar Novo Frete (Completo)" @click="mostrarModalFreteCompleto = true" />
        <LightButton label="Voltar" @click="router.back()" />
      </div>
    </header>

    <div class="filter-bar">
      <input
        type="text"
        v-model="buscaCarga"
        placeholder="Pesquisar Carga..."
        class="filter-input"
      />
      <select v-model="filtroUsuario" class="filter-select">
        <option value="">Todos os usuários</option>
        <option v-for="e in listaUsuariosUnicos" :key="e" :value="e">
          {{ e }}
        </option>
      </select>
      <input
        type="number"
        v-model="filtroPrecoMax"
        placeholder="Preço Máx (R$)"
        class="filter-input"
      />
      <LightButton
        label="Limpar"
        @click="
          buscaCarga = '';
          filtroUsuario = '';
          filtroPrecoMax = '';
        "
        v-if="buscaCarga || filtroUsuario || filtroPrecoMax"
      />
    </div>

    <div v-if="freteStore.loading" class="loader-container">
      <div class="loader"></div>
    </div>

    <div v-else-if="fretesFiltrados.length" class="table-wrapper">
      <table class="fretes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Solicitante</th>
            <th>Carga</th>
            <th>Motorista</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in fretesFiltrados" :key="f.id">
            <td>#{{ f.id }}</td>
            <td>{{ f.usuario_email }}</td>
            <td class="clickable" @click="abrirCarga(f.carga)">
              {{ obterDescricaoCarga(f.carga) }}
            </td>
            <td class="clickable" @click="abrirMotorista(f.motorista)">
              {{ obterNomeMotorista(f.motorista) }}
            </td>
            <td>{{ f.valor_frete }} {{ f.moeda }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(f.status)]">{{
                f.status
              }}</span>
            </td>
            <td class="actions-cell">
              <LightButton label="Editar" @click="prepararEdicao(f)" />
              <LightButton
                label="Carga"
                @click="prepararEdicaoCarga(f.carga)"
              />
              <LightButton
                label="Excluir"
                class="btn-danger"
                @click="excluirFrete(f.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-results">Nenhum frete encontrado.</div>
    
    <ModalDetalhesCarga
      :isOpen="mostrarModalCarga"
      :carga="freteStore.detalheCarga"
      @close="mostrarModalCarga = false"
    />
    <ModalDetalhesMotorista
      :isOpen="mostrarModalMotorista"
      :motorista="freteStore.detalheMotorista"
      @close="mostrarModalMotorista = false"
    />
    <ModalEditarCarga
      :isOpen="mostrarModalEditarCarga"
      :carga="cargaSelecionada"
      @close="mostrarModalEditarCarga = false"
      @salvo="carregarDadosDoPainel"
    />
    <ModalEditarFrete
      :isOpen="mostrarModalEditar"
      :frete="freteSelecionado"
      :opcoes="freteStore.opcoes"
      @close="mostrarModalEditar = false"
      @salvo="carregarDadosDoPainel"
    />

    <!-- ➔ Wizard Integrado -->
    <ModalCriarFreteCompleto
      :isOpen="mostrarModalFreteCompleto"
      @close="() => { mostrarModalFreteCompleto = false; carregarDadosDoPainel(); }"
    />
  </div>
</template>

<style scoped>
.admin-container {
  padding: 40px;
  background: #f2f2f2;
  min-height: 100vh;
  font-family: sans-serif;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 20px;
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

.actions-cell :deep(button) {
  width: auto;
  padding: 6px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
}

.filter-bar {
  display: flex;
  gap: 20px;
  background: #fff;
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 24px;
  align-items: center;
  border: 1px solid #e0e0e0;
}
.filter-input,
.filter-select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  flex: 1;
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
.actions-cell {
  display: flex;
  gap: 8px;
}
.btn-danger {
  color: #b3261e !important;
}
.empty-results {
  text-align: center;
  padding: 48px;
  background: #fff;
  border-radius: 14px;
  color: #6b6b6b;
}
.loader-container {
  display: flex;
  justify-content: center;
  margin-top: 80px;
}
.loader {
  width: 42px;
  height: 42px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #141414;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>