<script setup>
import {useRouter} from 'vue-router' 
import LightButton from '../components/LightButton.vue';

const router = useRouter()

function verFretes() {
    router.push('/fretesadm')
}
function verUsuarios() {
    router.push('/usuarioslist')
}
</script>
<template>
<LightButton @click="verFretes" label="Fretes" ></LightButton>
<LightButton @click="verUsuarios" label="Usuarios"></LightButton>
</template>