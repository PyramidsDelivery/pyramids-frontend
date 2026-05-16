<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';

const router = useRouter();
const freteStore = useFreteStore();

// Controle de visibilidade dos modais
const mostrarModalCarga = ref(false);
const mostrarModalMotorista = ref(false);

onMounted(async () => {
  await freteStore.carregarFretes();
});

const listaFretes = computed(() => freteStore.listaFretes || []);

const getStatusClass = (status) => {
  if (!status) return 'status-default';
  return `status-${status
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')}`;
};

// Funções para abrir detalhes
const abrirCarga = async (id) => {
  await freteStore.buscarDetalheCarga(id);
  mostrarModalCarga.value = true;
};

const abrirMotorista = async (id) => {
  await freteStore.buscarDetalheMotorista(id);
  mostrarModalMotorista.value = true;
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
    <button class="back-button" @click="router.back()">Voltar</button>
  </div>
    </header>

    <div v-if="freteStore.loading" class="loader-container">
      <div class="loader"></div>
      <span>Buscando dados no servidor...</span>
    </div>

    <div v-else-if="listaFretes.length" class="table-wrapper">
      <table class="fretes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Carga</th>
            <th>Motorista</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="frete in listaFretes" :key="frete.id">
            <td class="id-cell">#{{ frete.id }}</td>
            
            <td class="clickable-cell" @click="abrirCarga(frete.carga)">
              {{ frete.carga }}
            </td>

            <td class="clickable-cell" @click="abrirMotorista(frete.motorista)">
              {{ frete.motorista }}
            </td>

            <td class="price-cell">
               {{ frete.valor_frete }} {{ frete.moeda }}
            </td>
            <td>
              <span :class="['status-badge', getStatusClass(frete.status)]">
                {{ frete.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
<div v-if="mostrarModalCarga" class="modal-overlay" @click.self="mostrarModalCarga = false">
  <div class="modal-content">
    <h3>Detalhes da Carga #{{ freteStore.detalheCarga?.id }}</h3>
    <hr />
    
    <div v-if="freteStore.detalheCarga" class="details-grid">
      <p><strong>Descrição:</strong> {{ freteStore.detalheCarga.descricao }}</p>
      <p><strong>Peso:</strong> {{ freteStore.detalheCarga.peso }} {{ freteStore.detalheCarga.unidade || 'kg' }}</p>
      
      </div>

    <div v-if="freteStore.detalheCarga" class="foto-produto-container">
      <label class="foto-label"><strong>Foto do Produto:</strong></label>
      
   <img 
  v-if="freteStore.detalheCarga.foto_url" 
  :src="freteStore.detalheCarga.foto_url.startsWith('http') 
        ? freteStore.detalheCarga.foto_url 
        : 'http://localhost:8000' + freteStore.detalheCarga.foto_url" 
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
    <div v-if="mostrarModalMotorista" class="modal-overlay" @click.self="mostrarModalMotorista = false">
      <div class="modal-content">
        <h3>Informações do Motorista</h3>
        <hr />
        <div v-if="freteStore.detalheMotorista" class="details-grid">
          <p><strong>Nome:</strong> {{ freteStore.detalheMotorista.nome }}</p>
          <p><strong>CNH:</strong> {{ freteStore.detalheMotorista.cnh }}</p>
          <p><strong>Telefone:</strong> {{ freteStore.detalheMotorista.telefone }}</p> 
        </div>
        <button class="close-btn" @click="mostrarModalMotorista = false">Fechar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.foto-produto-container {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background-color: #fdfdfd;
  padding: 10px;
  border-radius: 6px;
}

.foto-label {
  align-self: flex-start;
  color: #444;
  font-size: 0.95rem;
}

.foto-detalhe {
  width: 100%;
  max-width: 280px; /* Impede a imagem de esticar demais */
  height: auto;
  max-height: 200px; /* Mantém uma altura controlada dentro do modal */
  object-fit: contain; /* Encaixa a foto perfeitamente sem cortar os lados do produto */
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  background: #f7f7f7;
}

.sem-foto-placeholder {
  width: 100%;
  max-width: 280px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  border-radius: 6px;
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
  background-color: #fafafa;
}
.clickable-cell {
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
}

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

.details-grid p {
  margin: 10px 0;
}

.close-btn {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
* {
  box-sizing: border-box;
}

.admin-container {
  min-height: 100vh;
  padding: 40px;
  background: #f5f5f5;
  font-family: 'Inter', sans-serif;
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

.back-button {
  border: none;
  background: #111;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}

.back-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

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

.fretes-table tbody tr {
  transition: background 0.2s ease;
}

.fretes-table tbody tr:hover {
  background: #fafafa;
}

.id-cell {
  color: #8b8b8b;
  font-family: monospace;
}

.driver-cell {
  font-weight: 600;
  color: #111;
}

.price-cell {
  font-weight: 700;
  color: #111;
}

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

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 80px;
  color: #666;
}

.loader {
  width: 45px;
  height: 45px;
  margin-bottom: 15px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.empty-state h2 {
  margin-bottom: 10px;
}

.empty-state p {
  color: #666;
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
