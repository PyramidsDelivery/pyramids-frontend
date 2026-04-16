<script setup>
defineProps({
  label: String
})
</script>

<template>
  <button class="btn-dark">
    {{ label }}
  </button>
</template>

<style scoped>
.btn-dark {
  background-color: var(--color-dark);
  color: var(--color-light);
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 16px;
  font-weight: 700;
  border: none;
  width: 100%;
  transition: background-color 0.3s ease, transform 0.1s ease;

  /* 🔥 melhora comportamento no mobile */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* hover (desktop) */
.btn-dark:hover {
  background-color: var(--color-dark-hover);
}

/* efeito de clique */
.btn-dark:active {
  transform: scale(0.96);
}

/* 🔥 garante funcionamento em touch devices */
@media (hover: none) {
  .btn-dark:active {
    transform: scale(0.96);
  }
}
</style>