<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFreteStore } from '../stores/freteStore';
import api from '../services/api';
import DarkButton from '../components/DarkButton.vue';

const props = defineProps({
  rotaIdPreDefinido: { type: [Number, String], default: null },
  cargaIdPreDefinido: { type: [Number, String], default: null }
});

const emit = defineEmits(['frete-criado', 'salvo', 'cancelar']);

const freteStore = useFreteStore();
const router = useRouter();

const form = ref({
  carga: '',
  motorista: '',
  veiculo: '',
  rota: '',
  valor_frete: '',
  moeda: 'Reais',
  status: 'PENDENTE'
});

const carregarDadosDoPasso = async () => {
  if (!freteStore.opcoes) freteStore.opcoes = {};
  freteStore.opcoes.cargas = [];
  freteStore.opcoes.rotas = [];
  freteStore.opcoes.motoristas = [];
  freteStore.opcoes.veiculos = [];

  try {
    const userRes = await api.get('usuarios/me/');
    const isAdmin = userRes.data?.is_staff || userRes.data?.is_superuser;
    const userId = userRes.data.id;

    const cargasRes = await api.get('cargas/');
    const todasCargas = Array.isArray(cargasRes.data) ? cargasRes.data : (cargasRes.data?.results || []);
    
    if (isAdmin) {
      freteStore.opcoes.cargas = todasCargas;
    } else {
      freteStore.opcoes.cargas = todasCargas.filter(c => c.user == userId || c.usuario == userId || c.criado_por == userId);
    }

    const rotasRes = await api.get('rotas/');
    const todasRotas = Array.isArray(rotasRes.data) ? rotasRes.data : (rotasRes.data?.results || []);
    
    if (isAdmin) {
      freteStore.opcoes.rotas = todasRotas;
    } else {
      freteStore.opcoes.rotas = todasRotas.filter(r => r.user == userId || r.usuario == userId || r.criado_por == userId);
    }

  } catch (e) {
    console.warn(e);
  }

  try {
    const motoristasRes = await api.get('motoristas/');
    freteStore.opcoes.motoristas = Array.isArray(motoristasRes.data) ? motoristasRes.data : (motoristasRes.data?.results || []);
  } catch (e) {
    console.error("Erro ao carregar motoristas:", e);
  }

  try {
    const veiculosRes = await api.get('veiculos/');
    freteStore.opcoes.veiculos = Array.isArray(veiculosRes.data) ? veiculosRes.data : (veiculosRes.data?.results || []);
  } catch (e) {
    console.error("Erro ao carregar veículos:", e);
  }

  if (props.cargaIdPreDefinido) {
    form.value.carga = props.cargaIdPreDefinido;
    const jaExiste = freteStore.opcoes.cargas.some(c => c.id == props.cargaIdPreDefinido);
    if (!jaExiste) {
      try {
        const res = await api.get(`cargas/${props.cargaIdPreDefinido}/`);
        freteStore.opcoes.cargas.push(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  }

  if (props.rotaIdPreDefinido) {
    form.value.rota = props.rotaIdPreDefinido;
    const jaExisteRota = freteStore.opcoes.rotas.some(r => r.id == props.rotaIdPreDefinido);
    if (!jaExisteRota) {
      try {
        const res = await api.get(`rotas/${props.rotaIdPreDefinido}/`);
        freteStore.opcoes.rotas.push(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  }
};

onMounted(async () => {
  await carregarDadosDoPasso();
});

watch(() => [props.cargaIdPreDefinido, props.rotaIdPreDefinido], async () => {
  await carregarDadosDoPasso();
});

const finalizarCadastro = async () => {
  if (!form.value.carga || !form.value.motorista || !form.value.valor_frete || !form.value.rota) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const sucesso = await freteStore.criarFrete(form.value);
  if (sucesso) {
    alert("Frete cadastrado com sucesso!");
    emit('frete-criado');
    emit('salvo');
  } else {
    alert("Erro ao cadastrar frete. Verifique o console.");
  }
};

const cancelarAcao = () => {
  emit('cancelar');
};
</script>

<template>
  <div class="admin-page">
    <div class="header-actions">
       <button @click="cancelarAcao" class="btn-voltar" type="button">← Cancelar</button>
       <h2>Criar Novo Frete</h2>
    </div>

    <div v-if="freteStore.loading" class="loader">Carregando dados do servidor...</div>

    <div v-else class="form-container">
      <label>Selecione a Carga:</label>
      <select v-model="form.carga">
        <option value="">Selecione uma carga</option>
        <option v-for="c in freteStore.opcoes?.cargas" :key="c.id" :value="c.id">
          {{ c.descricao || `Carga #${c.id}` }}
        </option>
      </select>

      <label>Selecione o Motorista:</label>
      <select v-model="form.motorista">
        <option value="">Escolha o motorista...</option>
        <option v-for="m in freteStore.opcoes?.motoristas" :key="m.id" :value="m.id">
          {{ m.nome || m.usuario_email || `Motorista #${m.id}` }}
        </option>
      </select>

      <label>Selecione o Veículo:</label>
      <select v-model="form.veiculo">
        <option value="">Escolha o veículo...</option>
        <option v-for="v in freteStore.opcoes?.veiculos" :key="v.id" :value="v.id">
          {{ v.modelo || 'Veículo' }} - {{ v.placa || `#${v.id}` }}
        </option>
      </select>

      <label>Selecione a Rota:</label>
      <select v-model="form.rota">
        <option value="">Escolha a rota...</option>
        <option v-for="r in freteStore.opcoes?.rotas" :key="r.id" :value="r.id">
          {{ r.nome || `${r.ponto_inicial} → ${r.ponto_final}` || `Rota #${r.id}` }}
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
        <DarkButton label="Gravar Frete no Sistema" @click="finalizarCadastro" type="button" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 1rem;
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