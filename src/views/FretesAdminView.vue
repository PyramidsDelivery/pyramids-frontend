<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useFreteStore } from "../stores/freteStore";
import api from "../services/api";

const router = useRouter();
const freteStore = useFreteStore();

const mostrarModalCarga = ref(false);
const mostrarModalMotorista = ref(false);
const mostrarModalEditar = ref(false);
const mostrarModalEditarCarga = ref(false);

const filtroPrecoMax = ref("");
const filtroUsuario = ref("");
const buscaCarga = ref("");

const freteSelecionado = ref({
  id: null,
  carga: "",
  motorista: "",
  veiculo: "",
  rota: "",
  valor_frete: "",
  moeda: "",
  status: "",
});
const cargaSelecionada = ref({
  id: null,
  descricao: "",
  peso: "",
  unidade: "kg",
  valor: "",
  movera: "Reais",
});

const carregarDadosDoPainel = async () => {
  await Promise.all([
    freteStore.carregarFretes(),
    freteStore.buscarOpcoesCadastro(),
  ]);
};

onMounted(carregarDadosDoPainel);

router.afterEach((to) => {
  if (to.path.includes("admin") || to.name?.includes("admin"))
    carregarDadosDoPainel();
});

const listaFretes = computed(() => {
  const fretes = freteStore.listaFretes;
  return Array.isArray(fretes) ? fretes : fretes?.results || [];
});

const listaUsuariosUnicos = computed(() => {
  return [
    ...new Set(
      listaFretes.value.map((f) => f.usuario_email).filter((e) => e?.trim()),
    ),
  ].sort();
});

const obterDescricaoCarga = (id) => {
  const lista = freteStore.opcoes?.cargas;
  const listaLimpa = Array.isArray(lista) ? lista : lista?.results || [];
  return (
    listaLimpa.find((c) => parseInt(c.id, 10) === parseInt(id, 10))
      ?.descricao || `Carga #${id}`
  );
};

const obterNomeMotorista = (id) => {
  const lista = freteStore.opcoes?.motoristas;
  const listaLimpa = Array.isArray(lista) ? lista : lista?.results || [];
  return (
    listaLimpa.find((m) => parseInt(m.id, 10) === parseInt(id, 10))?.nome ||
    `Motorista #${id}`
  );
};

const fretesFiltrados = computed(() => {
  return listaFretes.value.filter((frete) => {
    if (
      filtroPrecoMax.value &&
      parseFloat(frete.valor_frete) > parseFloat(filtroPrecoMax.value)
    )
      return false;
    if (filtroUsuario.value && frete.usuario_email !== filtroUsuario.value)
      return false;
    if (
      buscaCarga.value &&
      !obterDescricaoCarga(frete.carga)
        .toLowerCase()
        .includes(buscaCarga.value.toLowerCase())
    )
      return false;
    return true;
  });
});

const getStatusClass = (s) =>
  `status-${
    s
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "default"
  }`;

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

const salvarEdicao = async () => {
  try {
    const { id, carga, motorista, veiculo, rota } = freteSelecionado.value;
    const dadosFormatados = {
      ...freteSelecionado.value,
      carga: carga ? parseInt(carga, 10) : null,
      motorista: motorista ? parseInt(motorista, 10) : null,
      veiculo: veiculo ? parseInt(veiculo, 10) : null,
      rota: rota ? parseInt(rota, 10) : null,
    };
    await api.put(`fretes/${id}/`, dadosFormatados);
    mostrarModalEditar.value = false;
    await carregarDadosDoPainel();
  } catch (error) {
    alert("Não foi possível salvar as alterações do frete.");
  }
};

const prepararEdicaoCarga = (idCarga) => {
  const lista = freteStore.opcoes?.cargas;
  const listaLimpa = Array.isArray(lista) ? lista : lista?.results || [];
  const cargaOrigem = listaLimpa.find(
    (c) => parseInt(c.id, 10) === parseInt(idCarga, 10),
  );
  if (cargaOrigem) {
    cargaSelecionada.value = { ...cargaOrigem };
    mostrarModalEditarCarga.value = true;
  }
};

const salvarEdicaoCarga = async () => {
  try {
    await api.put(
      `cargas/${cargaSelecionada.value.id}/`,
      cargaSelecionada.value,
    );
    mostrarModalEditarCarga.value = false;
    await carregarDadosDoPainel();
  } catch (error) {
    alert("Não foi possível salvar as alterações da carga.");
  }
};

const limparFiltros = () => {
  filtroPrecoMax.value = "";
  filtroUsuario.value = "";
  buscaCarga.value = "";
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
        <button class="add-button" @click="router.push('/fretes/novo')">
          + Novo Frete
        </button>
        <button class="add-button" @click="router.push('/cargas/novo')">
          + Nova carga
        </button>
        <button class="back-button" @click="router.back()">Voltar</button>
      </div>
    </header>

    <div class="filter-bar">
      <div class="filter-group">
        <label for="busca-carga">Pesquisar Carga:</label>
        <input
          id="busca-carga"
          type="text"
          v-model="buscaCarga"
          placeholder="Ex: Alimentos, ferro, grãos..."
          class="filter-input"
        />
      </div>
      <div class="filter-group">
        <label for="filtro-user">Solicitante:</label>
        <select id="filtro-user" v-model="filtroUsuario" class="filter-select">
          <option value="">Todos os usuários</option>
          <option
            v-for="email in listaUsuariosUnicos"
            :key="email"
            :value="email"
          >
            {{ email }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label for="preco-max">Preço Máximo (R$):</label>
        <input
          id="preco-max"
          type="number"
          v-model="filtroPrecoMax"
          placeholder="0.00"
          class="filter-input"
        />
      </div>
      <button
        class="clear-filters-btn"
        @click="limparFiltros"
        v-if="buscaCarga || filtroUsuario || filtroPrecoMax"
      >
        Limpar Filtros
      </button>
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
          <tr v-for="frete in fretesFiltrados" :key="frete.id">
            <td class="id-cell">#{{ frete.id }}</td>
            <td class="user-cell">
              {{ frete.usuario_email || "Não informado" }}
            </td>
            <td class="clickable-cell" @click="abrirCarga(frete.carga)">
              {{ obterDescricaoCarga(frete.carga) }}
            </td>
            <td class="clickable-cell" @click="abrirMotorista(frete.motorista)">
              {{ obterNomeMotorista(frete.motorista) }}
            </td>
            <td class="price-cell">
              {{ frete.valor_frete }} {{ frete.moeda }}
            </td>
            <td>
              <span :class="['status-badge', getStatusClass(frete.status)]">{{
                frete.status
              }}</span>
            </td>
            <td class="actions-cell">
              <button class="edit-btn" @click="prepararEdicao(frete)">
                Editar Frete
              </button>
              <button
                class="edit-carga-btn"
                @click="prepararEdicaoCarga(frete.carga)"
              >
                Editar Carga
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-results-container">
      Nenhum frete corresponde aos filtros aplicados ou banco vazio.
    </div>

    <div
      v-if="mostrarModalEditar"
      class="modal-overlay"
      @click.self="mostrarModalEditar = false"
    >
      <div class="modal-content modal-form">
        <h3>Editar Frete #{{ freteSelecionado.id }}</h3>
        <hr />
        <div class="form-grid">
          <label>Carga:</label>
          <select v-model="freteSelecionado.carga">
            <option
              v-for="c in freteStore.opcoes.cargas"
              :key="c.id"
              :value="c.id"
            >
              {{ c.descricao }}
            </option>
          </select>
          <label>Motorista:</label>
          <select v-model="freteSelecionado.motorista">
            <option
              v-for="m in freteStore.opcoes.motoristas"
              :key="m.id"
              :value="m.id"
            >
              {{ m.nome }}
            </option>
          </select>
          <label>Veículo:</label>
          <select v-model="freteSelecionado.veiculo">
            <option
              v-for="v in freteStore.opcoes.veiculos"
              :key="v.id"
              :value="v.id"
            >
              {{ v.modelo }} ({{ v.placa }})
            </option>
          </select>
          <label>Rota:</label>
          <select v-model="freteSelecionado.rota">
            <option
              v-for="r in freteStore.opcoes.rotas"
              :key="r.id"
              :value="r.id"
            >
              {{ r.nome || `${r.ponto_inicial} → ${r.ponto_final}` }}
            </option>
          </select>
          <label>Moeda:</label>
          <select v-model="freteSelecionado.moeda">
            <option value="Reais">Reais (R$)</option>
            <option value="Euro">Euro (€)</option>
            <option value="Dolar">Dólar ($)</option>
          </select>
          <label>Valor do Frete:</label>
          <input
            type="number"
            v-model="freteSelecionado.valor_frete"
            step="0.01"
          />
          <label>Status:</label>
          <input type="text" v-model="freteSelecionado.status" />
        </div>
        <div class="modal-actions">
          <button class="save-btn" @click="salvarEdicao">
            Salvar Alterações
          </button>
          <button class="close-btn" @click="mostrarModalEditar = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalEditarCarga"
      class="modal-overlay"
      @click.self="mostrarModalEditarCarga = false"
    >
      <div class="modal-content modal-form">
        <h3>Editar Carga #{{ cargaSelecionada.id }}</h3>
        <hr />
        <div class="form-grid">
          <label>Descrição da Carga:</label>
          <input type="text" v-model="cargaSelecionada.descricao" />
          <label>Peso:</label>
          <input type="number" v-model="cargaSelecionada.peso" step="0.1" />
          <label>Unidade de Medida:</label>
          <select v-model="cargaSelecionada.unidade">
            <option value="kg">Quilos (kg)</option>
            <option value="t">Toneladas (t)</option>
          </select>
          <label>Valor Declarado:</label>
          <input type="number" v-model="cargaSelecionada.valor" step="0.01" />
          <label>Moeda do Valor:</label>
          <select v-model="cargaSelecionada.movera">
            <option value="Reais">Reais (R$)</option>
            <option value="Euro">Euro (€)</option>
            <option value="Dolar">Dólar ($)</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="save-btn" @click="salvarEdicaoCarga">
            Atualizar Carga
          </button>
          <button class="close-btn" @click="mostrarModalEditarCarga = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalCarga"
      class="modal-overlay"
      @click.self="mostrarModalCarga = false"
    >
      <div class="modal-content">
        <h3>Detalhes da Carga #{{ freteStore.detalheCarga?.id }}</h3>
        <hr />
        <div v-if="freteStore.detalheCarga" class="details-grid">
          <p>
            <strong>Descrição:</strong> {{ freteStore.detalheCarga.descricao }}
          </p>
          <p>
            <strong>Peso:</strong> {{ freteStore.detalheCarga.peso }}
            {{ freteStore.detalheCarga.unidade || "kg" }}
          </p>
        </div>
        <button class="close-btn" @click="mostrarModalCarga = false">
          Fechar
        </button>
      </div>
    </div>

    <div
      v-if="mostrarModalMotorista"
      class="modal-overlay"
      @click.self="mostrarModalMotorista = false"
    >
      <div class="modal-content">
        <h3>Informações do Motorista</h3>
        <hr />
        <div v-if="freteStore.detalheMotorista" class="details-grid">
          <p><strong>Nome:</strong> {{ freteStore.detalheMotorista.nome }}</p>
          <p><strong>CNH:</strong> {{ freteStore.detalheMotorista.cnh }}</p>
          <p>
            <strong>Telefone:</strong>
            {{ freteStore.detalheMotorista.telefone }}
          </p>
        </div>
        <button class="close-btn" @click="mostrarModalMotorista = false">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estrutura Base e Header */
* {
  box-sizing: border-box;
}
.admin-container {
  min-height: 100vh;
  padding: 40px;
  background: #f5f5f5;
  font-family: "Inter", sans-serif;
  color: #1a1a1a;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
  padding-left: 20px;
  border-left: 5px solid #111;
}
.admin-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1px;
  text-transform: uppercase;
}
.admin-header p {
  margin-top: 6px;
  color: #666;
}
.header-btns,
.actions-cell,
.modal-actions {
  display: flex;
  gap: 8px;
}

/* Botões Globais da View */
.add-button,
.back-button,
.edit-btn,
.edit-carga-btn,
.save-btn,
.close-btn,
.clear-filters-btn {
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}
.add-button,
.back-button {
  background: #111;
  color: white;
}
.back-button {
  background: #e0e0e0;
  color: #111;
}
.edit-btn {
  background: #f0a500;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
}
.edit-carga-btn {
  background: #007bff;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
}
.save-btn {
  background: #28a745;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
}
.close-btn {
  background: #333;
  color: white;
  padding: 10px;
  border-radius: 4px;
  width: 100%;
  margin-top: 20px;
}
.clear-filters-btn {
  background: #dc3545;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}
.add-button:hover,
.back-button:hover,
.edit-btn:hover,
.edit-carga-btn:hover,
.save-btn:hover,
.clear-filters-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Grid de Filtros */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  align-items: flex-end;
  border: 1px solid #e9ecef;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 180px;
}
.filter-group label,
.form-grid label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
}
.filter-input,
.filter-select,
.form-grid select,
.form-grid input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  width: 100%;
}

/* Tabelas e Resultados */
.table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.fretes-table {
  width: 100%;
  border-collapse: collapse;
}
.fretes-table thead {
  background: #111;
}
.fretes-table th {
  padding: 18px 20px;
  color: white;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.fretes-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #ececec;
  font-size: 0.95rem;
  color: #444;
}
.fretes-table tbody tr:hover {
  background: #fafafa;
}
.id-cell {
  color: #8b8b8b;
  font-family: monospace;
}
.price-cell {
  font-weight: 700;
  color: #111;
}
.user-cell {
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
}
.clickable-cell {
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
}
.empty-results-container {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ced4da;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.status-pendente {
  background: #fff3cd;
  color: #856404;
}
.status-concluido {
  background: #111;
  color: white;
}
.status-em-transito {
  background: #e3f2fd;
  color: #0d47a1;
}
.status-default {
  background: #e0e0e0;
  color: #444;
}

/* Estrutura dos Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
  color: #333;
}
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  margin-bottom: 20px;
}
.details-grid p {
  margin: 10px 0;
}

/* Loader */
.loader-container {
  display: flex;
  justify-content: center;
  margin-top: 80px;
}
.loader {
  width: 45px;
  height: 45px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #111;
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

@media (max-width: 768px) {
  .admin-container {
    padding: 20px;
  }
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .fretes-table th,
  .fretes-table td {
    padding: 14px;
    font-size: 0.85rem;
  }
  .status-badge {
    min-width: auto;
    width: 100%;
  }
}
</style>
