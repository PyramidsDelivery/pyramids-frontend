<script setup>
defineProps({
  label: String
})
</script>

<template>
  <button class="btn-light">
    {{ label }}
  </button>
</template>
<style scoped>
.btn-light {
  background-color: var(--color-light);
  color: var(--color-dark);
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  border-radius: 16px;
  font-weight: 700;
  border: none;
  transition: background-color 0.3s ease;
}
.btn-light:hover {
  background-color: var(--color-light-hover);
}
.btn-light:active {
  transform: scale(0.97);
}
</style>