<script setup>
import { ref } from 'vue';
import { useFreteStore } from '../stores/freteStore';
import ModalNovaRota from './ModalNovaRota.vue';
import CriarCargaView from '../views/CriarCargaView.vue';
import CriarFreteView from '../views/CriarFreteView.vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const freteStore = useFreteStore();

const passo = ref(1);
const rotaIdSelecionada = ref(null);
const cargaIdSelecionada = ref(null);
const erroCriacao = ref('');

const aoCriarRota = (id) => {
  rotaIdSelecionada.value = id;
  passo.value = 2;
  erroCriacao.value = '';
};

const aoCriarCarga = (id) => {
  cargaIdSelecionada.value = id;
  passo.value = 3;
  erroCriacao.value = '';
};

const aoConcluirFrete = () => {
  fecharModal();
};

const fecharModal = () => {
  passo.value = 1;
  rotaIdSelecionada.value = null;
  cargaIdSelecionada.value = null;
  erroCriacao.value = '';
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="fecharModal">
    <div class="modal-conteudo-principal">
      <div class="modal-topo">
        <h2>Criar Novo Frete — Passo {{ passo }} de 3</h2>
        <button class="btn-fechar" @click="fecharModal" type="button">&times;</button>
      </div>
      <hr class="divider" />

      <div v-if="erroCriacao" class="alert-erro">
        {{ erroCriacao }}
      </div>

      <div v-if="passo === 1">
        <ModalNovaRota @rota-criada="aoCriarRota" @close="fecharModal" />
      </div>

      <div v-if="passo === 2">
        <CriarCargaView @carga-criada="aoCriarCarga" @close="fecharModal" />
      </div>

      <div v-if="passo === 3">
        <CriarFreteView 
          :rotaIdPreDefinido="rotaIdSelecionada" 
          :cargaIdPreDefinido="cargaIdSelecionada" 
          @frete-criado="aoConcluirFrete"
          @salvo="aoConcluirFrete"
          @cancelar="fecharModal"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-conteudo-principal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 90vw;
  max-width: 950px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-topo h2 {
  font-size: 1.2rem;
  color: #111;
  margin: 0;
}
.btn-fechar {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
}
.divider {
  border: 0;
  border-top: 1px solid #eee;
  margin: 12px 0 20px 0;
}
.alert-erro {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  border: 1px solid #f5c6cb;
}
</style>