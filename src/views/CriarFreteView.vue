<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Importado para navegação
import { useFreteStore } from '../stores/freteStore';
import DarkButton from '../components/DarkButton.vue';

const freteStore = useFreteStore();
const router = useRouter(); // Instância do router

const form = ref({
  carga: '',
  motorista: '',
  veiculo: '',
  rota: '',
  valor_frete: '',
  moeda: 'Reais',
  status: 'PENDENTE'
});

onMounted(() => {
  freteStore.buscarOpcoesCadastro();
});

const finalizarCadastro = async () => {
  if (!form.value.carga || !form.value.motorista || !form.value.valor_frete || !form.value.rota) {
    alert("Por favor, preencha todos os campos, incluindo a Rota.");
    return;
  }

  const sucesso = await freteStore.criarFrete(form.value);
  if (sucesso) {
    alert("Frete cadastrado com sucesso!");
    router.back(); // Volta automaticamente após cadastrar
  } else {
    alert("Erro ao cadastrar frete. Verifique o console.");
  }
};

// Função para o botão voltar
const voltar = () => {
  router.back();
};
</script>

<template>
  <div class="admin-page">
    <div class="header-actions">
       <button @click="voltar" class="btn-voltar">← Voltar</button>
       <h2>Criar Novo Frete</h2>
    </div>

    <div v-if="freteStore.loading" class="loader">Carregando dados do servidor...</div>

    <div v-else class="form-container">
      <label>Selecione a Carga:</label>
      <select v-model="form.carga">
        <option value="">Selecione uma carga</option>
        <option v-for="c in freteStore.opcoes.cargas" :key="c.id" :value="c.id">
          {{ c.descricao }}
        </option>
      </select>

      <label>Selecione o Motorista:</label>
      <select v-model="form.motorista">
        <option value="">Escolha o motorista...</option>
        <option v-for="m in freteStore.opcoes.motoristas" :key="m.id" :value="m.id">
          {{ m.nome }}
        </option>
      </select>

      <label>Selecione o Veículo:</label>
      <select v-model="form.veiculo">
        <option value="">Escolha o veículo...</option>
        <option v-for="v in freteStore.opcoes.veiculos" :key="v.id" :value="v.id">
          {{ v.modelo }} ({{ v.placa }})
        </option>
      </select>

      <label>Selecione a Rota:</label>
      <select v-model="form.rota">
        <option value="">Escolha a rota...</option>
        <option v-for="r in freteStore.opcoes.rotas" :key="r.id" :value="r.id">
          {{ r.nome || `${r.ponto_inicial} → ${r.ponto_final}` || 'Rota sem nome' }}
        </option>
      </select>

      <label>Tipo de Moeda:</label>
      <select v-model="form.moeda">
        <option value="Reais">Reais (R$)</option>
        <option value="Euro">Euro (€)</option>
        <option value="Dolar">Dólar ($)</option>
      </select>

      <label>Valor do Frete:</label>
      <input type="number" v-model="form.valor_frete" placeholder="0.00" step="0.01">

      <label>Status:</label>
      <input type="text" v-model="form.status" placeholder="Ex: PENDENTE">

      <div class="button-group">
        <DarkButton label="Gravar Frete no Sistema" @click="finalizarCadastro" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.btn-voltar {
  background: none;
  border: 1px solid #ccc;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-voltar:hover {
  background: #eee;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

label {
  font-weight: bold;
  color: #444;
  margin-bottom: -10px;
}

select, input {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.button-group {
  margin-top: 10px;
}
</style>