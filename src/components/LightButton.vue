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
  border: 2px solid var(--color-input-border);
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  border-radius: 16px;
  font-weight: 600;
}
</style>