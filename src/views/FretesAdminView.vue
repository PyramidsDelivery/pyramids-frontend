# Administração de Fretes — Código Refatorado

```vue
<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';

const router = useRouter();
const freteStore = useFreteStore();

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
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <div>
        <h1>Administração de Fretes</h1>
        <p>Gerencie cargas e acompanhe os status em tempo real.</p>
      </div>

      <button class="back-button" @click="router.back()">
        Voltar
      </button>
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
          <tr
            v-for="frete in listaFretes"
            :key="frete.id"
          >
            <td class="id-cell">#{{ frete.id }}</td>

            <td>
              {{ frete.carga }}
            </td>

            <td class="driver-cell">
              {{ frete.motorista }}
            </td>

            <td class="price-cell">
              {{ frete.moeda }} {{ frete.valor_frete }}
            </td>

            <td>
              <span
                :class="['status-badge', getStatusClass(frete.status)]"
              >
                {{ frete.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <h2>Nenhum frete encontrado</h2>
      <p>Não existem cargas cadastradas no momento.</p>
    </div>
  </div>
</template>

<style scoped>
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
