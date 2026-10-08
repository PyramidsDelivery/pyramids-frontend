<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
const usuarios = ref([]);
const carregando = ref(true);
const router = useRouter();

onMounted(async () => {
  try {
    const res = await api.get("usuarios/");
    usuarios.value = res.data.results || res.data || [];
  } catch (e) {
    console.error("Erro ao buscar usuários:", e);
  } finally {
    carregando.value = false;
  }
});
const getNivel = (u) =>
  u.is_superuser ? "Superuser" : u.is_staff ? "Staff" : "Cliente";
const getNivelClass = (u) =>
  u.is_superuser
    ? "badge-superuser"
    : u.is_staff
      ? "badge-staff"
      : "badge-user";
</script>
<template>
  <div class="admin-container">
    <header class="admin-header">
      <div>
        <h1>Administração de Usuários</h1>
        <p>Gerencie usuários e permissões do sistema.</p>
      </div>
      <button class="btn-voltar" @click="router.back()">Voltar</button>
    </header>
    <div v-if="carregando" class="loader-container">
      <div class="loader"></div>
      <span>Buscando usuários...</span>
    </div>
    <div v-else-if="usuarios.length" class="table-wrapper">
      <table class="usuarios-table">
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
            <td class="id-cell">#{{ user.id }}</td>
            <td class="name-cell">{{ user.name || "Sem nome" }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['badge', getNivelClass(user)]">{{
                getNivel(user)
              }}</span>
            </td>
            <td>
              <span
                :class="[
                  'badge',
                  user.is_active ? 'badge-active' : 'badge-inactive',
                ]"
              >
                {{ user.is_active ? "Ativo" : "Inativo" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <h2>Nenhum usuário encontrado</h2>
      <p>Não existem usuários cadastrados no momento.</p>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  padding: 40px;
  background: #f5f5f5;
  font-family: "Inter", sans-serif;
  color: #1a1a1a;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
  padding-left: 20px;
  border-left: 5px solid #111;
}
.admin-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -1px;
}
.admin-header p {
  margin: 6px 0 0;
  color: #666;
}
.btn-voltar {
  background: #111;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
}
.btn-voltar:hover {
  opacity: 0.85;
}
.table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.usuarios-table {
  width: 100%;
  border-collapse: collapse;
}
.usuarios-table th,
.usuarios-table td {
  padding: 18px 20px;
  text-align: left;
}
.usuarios-table thead {
  background: #111;
}
.usuarios-table th {
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.usuarios-table td {
  border-bottom: 1px solid #ececec;
  font-size: 0.95rem;
  color: #444;
}
.usuarios-table tbody tr:hover {
  background: #fafafa;
}
.id-cell {
  color: #8b8b8b;
  font-family: monospace;
}
.name-cell {
  font-weight: 600;
  color: #111;
}
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge-superuser {
  background: #111;
  color: white;
}
.badge-staff {
  background: #e3f2fd;
  color: #0d47a1;
}
.badge-user {
  background: #f1f1f1;
  color: #444;
}
.badge-active {
  background: #d4edda;
  color: #155724;
}
.badge-inactive {
  background: #f8d7da;
  color: #721c24;
}
.loader-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
.loader-container {
  margin-top: 80px;
  color: #666;
  background: transparent;
  box-shadow: none;
}
.loader {
  width: 45px;
  height: 45px;
  margin-bottom: 15px;
  border: 4px solid #e5e5e5;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}
.empty-state h2 {
  margin-bottom: 10px;
}
.empty-state p {
  color: #666;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 768px) {
  .admin-container {
    padding: 20px;
  }
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .usuarios-table th,
  .usuarios-table td {
    padding: 14px;
    font-size: 0.85rem;
  }
}
</style>
