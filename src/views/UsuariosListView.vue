<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const usuarios = ref([])
const carregando = ref(true)
const router = useRouter()

onMounted(async () => {
  console.log("Iniciando busca de usuários...");
  try {
    const response = await api.get('usuarios/');
    console.log("Resposta recebida com sucesso:", response.data);
    usuarios.value = response.data.results;
  } catch (error) {
    console.error("Erro detectado na requisição:", error);
    if (error.response) {
       console.log("Detalhes do erro no Django:", error.response.data);
    }
  } finally {
    console.log("Finalizando estado de carregamento.");
    carregando.value = false;
  }
});
</script>
<template>
  <div class="usuarios-container">
    <h1>Lista de Usuários</h1>

  
    <table v-if="usuarios.length > 0" border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
      <thead>
       <tr>
  <th>ID</th>
  <th>Nome</th>
  <th>Email</th>
  <th>Nível</th> 
  <th>Status</th>
</tr>
      </thead>
      <tbody>
      
<tr v-for="user in usuarios" :key="user.id">
  <td>{{ user.id }}</td>
  <td>{{ user.name || 'Sem nome' }}</td>
  <td>{{ user.email }}</td>
  

  <td>
    <span v-if="user.is_superuser" class="badge-admin">Superuser</span>
    <span v-else-if="user.is_staff" class="badge-staff">Staff</span>
    <span v-else class="badge-user">Cliente</span>
  </td>

  <td>
    <span :style="{ color: user.is_active ? 'green' : 'red' }">
      {{ user.is_active ? 'Ativo' : 'Inativo' }}
    </span>
  </td>
</tr>
      </tbody>
    </table>
    
    <p v-else>Carregando usuários...</p>

    <button @click="router.back()" style="margin-top: 20px;">Voltar</button>
  </div>
</template>

<style scoped>
.usuarios-container { padding: 20px; }
table th, table td { padding: 10px; border: 1px solid #ddd; }
</style>