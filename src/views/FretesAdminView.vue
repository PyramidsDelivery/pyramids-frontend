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
    <h1>Administração de Fretes</h1>

    <div v-if="freteStore.loading" class="loader">Buscando dados no servidor...</div>

    <table v-else class="fretes-table">
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
          <td>#{{ frete.id }}</td>
          <td>{{ frete.carga }}</td>
          <td>{{ frete.motorista }}</td>
          <td>{{ frete.moeda }} {{ frete.valor_frete }}</td>
          <td>
            <span :class="'status-' + frete.status.toLowerCase()">
              {{ frete.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-container { padding: 20px; }
.fretes-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
.fretes-table th, .fretes-table td { 
  border: 1px solid #ddd; 
  padding: 12px; 
  text-align: left; 
}
.fretes-table th { background-color: #f4f4f4; }

/* Cores básicas para o status */
.status-pendente { color: #f39c12; font-weight: bold; }
.status-concluido { color: #27ae60; font-weight: bold; }
</style>