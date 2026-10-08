<script setup>
import { ref, watch } from "vue";
import DarkButton from "./DarkButton.vue";
import LightButton from "./LightButton.vue";
import api from "../services/api";

const props = defineProps({ isOpen: Boolean, carga: Object });
const emit = defineEmits(["close", "salvo"]);

const cargaLocal = ref({});

watch(
  () => props.carga,
  (novoVal) => {
    cargaLocal.value = { ...novoVal };
  },
  { immediate: true },
);

const salvar = async () => {
  try {
    const dados = { ...cargaLocal.value };
    if (typeof dados.foto === "string") delete dados.foto;
    if (!dados.unidade) dados.unidade = "kg";
    if (!dados.movera) dados.movera = "Reais";

    await api.put(`cargas/${dados.id}/`, dados);
    emit("salvo");
    emit("close");
  } catch (error) {
    console.error("Erro ao salvar carga:", error.response?.data);
    alert("Não foi possível salvar as alterações da carga.");
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content modal-form">
      <h3>Editar Carga #{{ cargaLocal.id }}</h3>
      <hr />
      <div class="form-grid">
        <label>Descrição</label>
        <input type="text" v-model="cargaLocal.descricao" />
        <label>Peso</label>
        <input type="number" v-model="cargaLocal.peso" step="0.1" />
        <label>Unidade</label>
        <select v-model="cargaLocal.unidade">
          <option value="kg">Quilos (kg)</option>
          <option value="t">Toneladas (t)</option>
        </select>
        <label>Valor</label>
        <input type="number" v-model="cargaLocal.valor" step="0.01" />
        <label>Moeda</label>
        <select v-model="cargaLocal.movera">
          <option value="Reais">Reais (R$)</option>
          <option value="Euro">Euro (€)</option>
          <option value="Dolar">Dólar ($)</option>
        </select>
      </div>
      <div class="modal-actions">
        <DarkButton label="Atualizar Carga" @click="salvar" />
        <LightButton label="Cancelar" @click="$emit('close')" />
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}
.form-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}
.form-grid input,
.form-grid select {
  padding: 10px 12px;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  width: 100%;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
.modal-actions :deep(button) {
  width: auto;
  padding: 8px 16px;
}
</style>
