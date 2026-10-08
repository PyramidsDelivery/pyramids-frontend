<script setup>
import { computed } from 'vue';
import { useFreteStore } from '../stores/freteStore';
import DarkButton from './DarkButton.vue';

const props = defineProps({
  isOpen: Boolean,
  frete: Object,
  nomeCarga: String,
  pontoInicial: String,
  pontoFinal: String
});

const emit = defineEmits(['close', 'responder']);
const freteStore = useFreteStore();

// Procura a rota na store de opções caso o frete traga apenas o ID
const rotaEncontrada = computed(() => {
  if (!props.frete?.rota) return null;
  if (typeof props.frete.rota === 'object') return props.frete.rota;
  return freteStore.opcoes.rotas.find(r => r.id === props.frete.rota);
});

const origemExibida = computed(() => {
  return props.pontoInicial || 
         props.frete?.rota_detalhes?.ponto_inicial || 
         rotaEncontrada.value?.ponto_inicial || 
         'Não informada';
});

const destinoExibido = computed(() => {
  return props.pontoFinal || 
         props.frete?.rota_detalhes?.ponto_final || 
         rotaEncontrada.value?.ponto_final || 
         'Não informada';
});

const confirmar = (status) => {
  emit('responder', status);
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-conteudo">
      <div class="modal-topo">
        <h2>Solicitação de Frete #{{ frete?.id }}</h2>
        <button class="btn-fechar" @click="emit('close')" type="button">&times;</button>
      </div>
      <hr class="divider" />

      <div class="modal-corpo" v-if="frete">
        <p><strong>Carga:</strong> {{ nomeCarga }}</p>
        
        <!-- Origem e Destino Atualizados -->
        <p><strong>Origem:</strong> {{ origemExibida }}</p>
        <p><strong>Destino:</strong> {{ destinoExibido }}</p>

        <p><strong>Valor do Frete:</strong> {{ frete.valor_frete }} {{ frete.moeda || 'Reais' }}</p>
        <p><strong>Data de Solicitação:</strong> {{ frete.data_criacao ? new Date(frete.data_criacao).toLocaleDateString('pt-BR') : '-' }}</p>
        <p class="aviso-regra">Deseja aceitar este pedido? Ao aceitar, este será o seu frete ativo até ser concluído.</p>
      </div>

      <div class="modal-rodape">
        <button class="btn-recusar" @click="confirmar('CANCELADO')">Recusar</button>
        <DarkButton label="Aceitar Frete" @click="confirmar('EM_TRANSITO')" />
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
.modal-conteudo {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 90vw;
  max-width: 500px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
.modal-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-topo h2 {
  font-size: 1.1rem;
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
  margin: 12px 0 16px 0;
}
.modal-corpo p {
  margin: 10px 0;
  font-size: 0.95rem;
  color: #333;
}
.aviso-regra {
  font-size: 0.85rem;
  color: #666;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
  margin-top: 15px;
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.btn-recusar {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-recusar:hover {
  background: #c0392b;
}
</style>