<script setup>
import LightButton from "./LightButton.vue";

defineProps({
  buscaCarga: { type: String, default: "" },
  filtroUsuario: { type: String, default: "" },
  filtroPrecoMax: { type: [String, Number], default: "" },
  filtroData: { type: String, default: "" },
  listaUsuariosUnicos: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false }
});

defineEmits([
  'update:buscaCarga',
  'update:filtroUsuario',
  'update:filtroPrecoMax',
  'update:filtroData',
  'limpar'
]);
</script>

<template>
  <div class="filter-bar">
    <!-- Pesquisa de Carga -->
    <input
      type="text"
      :value="buscaCarga"
      @input="$emit('update:buscaCarga', $event.target.value)"
      placeholder="Pesquisar Carga..."
      class="filter-input"
    />

    <!-- Filtro de Usuário (Apenas visível para Admins) -->
    <select
      v-if="isAdmin"
      :value="filtroUsuario"
      @change="$emit('update:filtroUsuario', $event.target.value)"
      class="filter-select"
    >
      <option value="">Todos os usuários</option>
      <option v-for="e in listaUsuariosUnicos" :key="e" :value="e">
        {{ e }}
      </option>
    </select>

    <!-- Preço Máximo -->
    <input
      type="number"
      :value="filtroPrecoMax"
      @input="$emit('update:filtroPrecoMax', $event.target.value)"
      placeholder="Preço Máx (R$)"
      class="filter-input"
    />

    <!-- Filtro de Data -->
    <input
      type="date"
      :value="filtroData"
      @input="$emit('update:filtroData', $event.target.value)"
      class="filter-input"
    />

    <!-- Botão Limpar -->
    <LightButton
      label="Limpar"
      @click="$emit('limpar')"
      v-if="buscaCarga || filtroUsuario || filtroPrecoMax || filtroData"
    />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 20px;
  background: #fff;
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 24px;
  align-items: center;
  border: 1px solid #e0e0e0;
  flex-wrap: wrap;
}
.filter-input,
.filter-select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  flex: 1;
  min-width: 180px;
}
</style>