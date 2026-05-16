<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
<template>
    <p>nós odiamos todos nossos clientes por isso você foi redirecionado para essa pagina vazia</p>
    <button class="add-button" @click="router.push('/fretes/novo')">
      + Novo Frete
    </button>
        <button class="add-button" @click="router.push('/cargas/novo')">
      + Novo carga
    </button>
</template>