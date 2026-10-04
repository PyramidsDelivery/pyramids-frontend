<script setup>
import LightButton from "./LightButton.vue";
defineProps({ isOpen: Boolean, carga: Object });
defineEmits(["close"]);
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
        <div class="foto-produto-container">
          <span class="foto-label"><strong>Foto da Carga:</strong></span>
          <img
            v-if="carga.foto"
            :src="carga.foto"
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
