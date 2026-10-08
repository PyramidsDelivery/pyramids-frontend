<script setup>
import LightButton from "./LightButton.vue";
defineProps({ isOpen: Boolean, motorista: Object });
defineEmits(["close"]);
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Informações do Motorista</h3>
      <hr />
      <div v-if="motorista" class="details-grid">
        <p><strong>Nome:</strong> {{ motorista.nome }}</p>
        <p><strong>CNH:</strong> {{ motorista.cnh }}</p>
        <p><strong>Telefone:</strong> {{ motorista.telefone }}</p>
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
}
.details-grid p {
  margin: 10px 0;
  font-size: 0.92rem;
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
