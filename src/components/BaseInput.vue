<script setup>
defineProps({
  modelValue: String,
  placeholder: String,
  type: { type: String, default: 'text' }
});
defineEmits(['update:modelValue']);
</script>

<template>
  <input 
    :type="type" 
    :placeholder="placeholder" 
    :value="modelValue" 
    @input="$emit('update:modelValue', $event.target.value)"
    class="base-input"
  />
</template> 

<style scoped>
.base-input {
  background-color: var(--color-input-bg);
  color: var(--color-input-txt);
  width: 100%;
  padding: 10px 10px;
  border: 2px solid var(--color-light);
  border-radius: 16px;
  transition: border-color 0.3s ease;
}

.base-input:focus {
  border-color: var(--color-dark);
  outline: none;
  color: var(--color-dark);
}

/* autofill */
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--color-input-bg) inset;
  -webkit-text-fill-color: var(--color-input-txt);
}
</style>