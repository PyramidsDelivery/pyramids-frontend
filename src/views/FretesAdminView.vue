<script setup>
import { onMounted } from 'vue';
import { useFreteStore } from '../stores/freteStore';

const freteStore = useFreteStore();

onMounted(() => {
  freteStore.carregarFretes();
});
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Administração de Fretes</h1>
      <p>Gerencie as cargas e status em tempo real.</p>
    </header>

    <div v-if="freteStore.loading" class="loader-container">
      <div class="loader"></div>
      <span>Buscando dados no servidor...</span>
    </div>

    <div v-else class="table-wrapper">
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
          <tr v-for="frete in freteStore.listaFretes" :key="frete.id">
            <td class="id-cell">#{{ frete.id }}</td>
            <td>{{ frete.carga }}</td>
            <td class="bold">{{ frete.motorista }}</td>
            <td class="price-cell">{{ frete.moeda }} {{ frete.valor_frete }}</td>
            <td>
              <span :class="['status-badge', 'status-' + frete.status.toLowerCase()]">
                {{ frete.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Base da Página */
.admin-container {
  padding: 40px;
  background-color: #f9f9f9; /* Cinza claro do fundo do login */
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #1a1a1a;
}

.admin-header {
  margin-bottom: 30px;
  border-left: 5px solid #1a1a1a;
  padding-left: 20px;
}

.admin-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: -1px;
}

.admin-header p {
  color: #666;
  margin-top: 5px;
}

/* Tabela Estilizada */
.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.fretes-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.fretes-table th {
  background-color: #1a1a1a; /* Preto da lateral do login */
  color: #ffffff;
  padding: 18px 20px;
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.fretes-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  color: #444;
  font-size: 0.95rem;
}

.fretes-table tr:hover {
  background-color: #fcfcfc;
}

/* Destaques de Células */
.id-cell {
  color: #999;
  font-family: monospace;
}

.bold {
  font-weight: 600;
  color: #1a1a1a;
}

.price-cell {
  font-weight: 700;
  color: #1a1a1a;
}

/* Badges de Status */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background-color: #e0e0e0; /* Default */
}

.status-pendente {
  background-color: #fff3cd;
  color: #856404;
}

.status-concluido {
  background-color: #1a1a1a; /* Preto para combinar com o tema */
  color: #ffffff;
}

.status-em-transito {
  background-color: #e3f2fd;
  color: #0d47a1;
}

/* Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  color: #666;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a1a1a;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>