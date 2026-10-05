<script setup>
import LightButton from "./LightButton.vue";
const props = defineProps({ isOpen: Boolean, carga: Object });
defineEmits(["close"]);

const obterUrlImagem = () => {
  // Pega o campo foto ou foto_url que vier do objeto carga
  const caminho = props.carga?.foto || props.carga?.foto_url;
  if (!caminho) return '';

  // Se na string tiver '/media/', corta tudo antes e usa o localhost do backend correto
  const indexMedia = caminho.indexOf('/media/');
  if (indexMedia !== -1) {
    const caminhoRelativo = caminho.substring(indexMedia);
    return `http://localhost:8000${caminhoRelativo}`;
  }

  if (caminho.startsWith('http')) {
    return caminho;
  }
  
  return `http://localhost:8000${caminho}`;
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Detalhes da Carga #{{ carga?.id }}</h3>
      <hr />
      <div v-if="carga" class="details-grid">
        <p><strong>Descrição:</strong> {{ carga.descricao }}</p>
        <p>
          <strong>Peso:</strong> {{ carga.peso }} {{ carga.unidade || "kg" }}
        </p>
        <p v-if="carga.valor">
          <strong>Valor:</strong> R$ {{ carga.valor }}
        </p>
        <div class="foto-produto-container">
          <span class="foto-label"><strong>Foto da Carga:</strong></span>
          <!-- AQUI MUDOU: Chamamos a função sem parâmetros -->
          <img
            v-if="carga.foto || carga.foto_url"
            :src="obterUrlImagem()"
            alt="Foto da carga"
            class="foto-detalhe"
          />
          <div v-else class="sem-foto-placeholder">Sem foto cadastrada</div>
        </div>
      </div>
      <div class="modal-actions">
        <LightButton label="Fechar" @click="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 20, 20, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
.details-grid p {
  margin: 10px 0;
  font-size: 0.92rem;
}
.foto-produto-container {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #fafafa;
  padding: 12px;
  border-radius: 10px;
}
.foto-detalhe {
  width: 100%;
  max-width: 280px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}
.sem-foto-placeholder {
  width: 100%;
  max-width: 280px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d8d8d8;
  border-radius: 8px;
  color: #9a9a9a;
  font-style: italic;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.modal-actions :deep(button) {
  width: auto;
  padding: 8px 16px;
}
</style>