<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const route = useRoute();
const user = ref({ foto: null, username: '', is_superuser: false, is_staff: false });
const visivel = ref(false);

const carregarUsuario = async () => {
  const token = localStorage.getItem('token');
  if (!token || route.name === 'login' || route.name === 'cadastro') {
    visivel.value = false;
    return;
  }
  try {
    const response = await api.get('usuarios/me/');
    if (response.data) {
      user.value = response.data;
      visivel.value = true;
    }
  } catch (err) {
    visivel.value = false;
  }
};

onMounted(carregarUsuario);
watch(() => route.path, carregarUsuario);

const irParaPerfil = () => {
  router.push('/perfil');
};

const voltarPagina = () => {
  const caminho = route.path;
  const isStaffStorage = localStorage.getItem('is_staff') === 'true';
  const isSuperStorage = localStorage.getItem('is_superuser') === 'true';
  const isAdmin = user.value.is_superuser || user.value.is_staff || isStaffStorage || isSuperStorage || route.meta.requiresAdmin;

  // --- FLUXO DO ADMINISTRADOR ---
  if (isAdmin) {
    // Se está no Perfil, volta para o Hub do Admin (/hubadmin)
    if (caminho === '/perfil') {
      router.push({ name: 'hubadmin' });
      return;
    }
    
    // Se está nas páginas secundárias de admin (/fretesadm ou /usuarioslist), volta para o Hub do Admin
    if (caminho === '/fretesadm' || caminho === '/usuarioslist') {
      router.push({ name: 'hubadmin' });
      return;
    }

    // Se já está no Hub do Admin, voltar faz logout e vai para a tela de Login
    if (caminho === '/hubadmin') {
      localStorage.clear();
      router.push({ name: 'login' });
      return;
    }

    // Caso padrão para qualquer outra rota de admin
    router.push({ name: 'hubadmin' });
    return;
  }

  // --- FLUXO DO USUÁRIO NORMAL / MOTORISTA ---
  if (caminho === '/perfil') {
    // Se veio do perfil, volta para o hub correspondente
    if (localStorage.getItem('user_type') === 'motorista') {
      router.push({ name: 'motorista-hub' });
    } else {
      router.push({ name: 'usuario-hub' });
    }
    return;
  }

  // Se está em formulários de criação, volta para o hub do usuário
  if (caminho === '/fretes/novo' || caminho === '/cargas/novo') {
    router.push({ name: 'usuario-hub' });
    return;
  }

  // Se já está no Hub de Usuário ou Hub de Motorista, voltar desloga e vai para o Login
  if (caminho === '/usuario-hub' || caminho === '/motorista-hub') {
    localStorage.clear();
    router.push({ name: 'login' });
    return;
  }

  // Fallback seguro
  router.push({ name: 'usuario-hub' });
};
</script>

<template>
  <div v-if="visivel" class="top-widget-container">
    <!-- Botão de Voltar Nativo Miniatura -->
    <button class="btn-voltar-tiny" @click="voltarPagina">Voltar</button>

    <!-- Avatar de Perfil Expandível para a Esquerda -->
    <div class="top-perfil-widget" @click="irParaPerfil">
      <span class="hover-text">Acessar Perfil</span>
      <div class="avatar-circle">
        <img v-if="user.foto" :src="user.foto" alt="Foto de Perfil" />
        <span v-else>{{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-widget-container {
  position: fixed;
  top: 14px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Botão de voltar miniatura */
.btn-voltar-tiny {
  background-color: #141414;
  color: #ffffff;
  border: 1px solid #333;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.btn-voltar-tiny:hover {
  background-color: #262626;
  border-color: #555;
}

/* Widget de Perfil Expandível */
.top-perfil-widget {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #141414;
  padding: 2px;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1.5px solid #ffffff;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  max-width: 32px;
  direction: rtl;
}

.top-perfil-widget:hover {
  max-width: 150px;
  padding-left: 8px;
  border-color: #e0e0e0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.avatar-circle {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 50%;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 700;
  font-size: 0.75rem;
  color: #fff;
  direction: ltr;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-text {
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  margin-right: 6px;
  transition: opacity 0.2s ease 0.1s;
  direction: ltr;
}

.top-perfil-widget:hover .hover-text {
  opacity: 1;
}
</style>