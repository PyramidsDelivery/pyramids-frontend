<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import DarkButton from '../components/DarkButton.vue';
import LightButton from '../components/LightButton.vue';
import BaseInput from '../components/BaseInput.vue';

const router = useRouter();
const loading = ref(false);
const erroMensagem = ref('');
const arquivoFoto = ref(null);
const fotoPreview = ref(null);

const formPerfil = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: ''
});

const formSenha = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
});

onMounted(async () => {
  loading.value = true;
  erroMensagem.value = '';
  try {
    const response = await api.get('usuarios/me/'); 
    if (response.data) {
      formPerfil.value = { ...response.data };
      if (response.data.foto) {
        fotoPreview.value = response.data.foto;
      }
    }
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    try {
      const responseAlt = await api.get('auth/user/');
      if (responseAlt.data) {
        formPerfil.value = { ...responseAlt.data };
        if (responseAlt.data.foto) {
          fotoPreview.value = responseAlt.data.foto;
        }
      }
    } catch (errAlt) {
      erroMensagem.value = "Não foi possível carregar os dados da conta. Verifique a rota da API.";
    }
  } finally {
    loading.value = false;
  }
});

const aoSelecionarFoto = (event) => {
  const file = event.target.files[0];
  if (file) {
    arquivoFoto.value = file;
    fotoPreview.value = URL.createObjectURL(file);
  }
};

const salvarPerfil = async () => {
  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('username', formPerfil.value.username || '');
    formData.append('email', formPerfil.value.email || '');
    formData.append('first_name', formPerfil.value.first_name || '');
    formData.append('last_name', formPerfil.value.last_name || '');
    
    if (arquivoFoto.value) {
      formData.append('foto', arquivoFoto.value);
    }

    await api.patch('usuarios/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('Perfil atualizado com sucesso!');
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err.response?.data || err);
    alert('Erro ao atualizar o perfil.');
  } finally {
    loading.value = false;
  }
};

const alterarSenha = async () => {
  if (formSenha.value.new_password !== formSenha.value.confirm_password) {
    alert('As novas senhas não coincidem.');
    return;
  }
  try {
    // Alinhado com a nova rota criada no UserViewSet do Django
    await api.post('usuarios/password/change/', {
      old_password: formSenha.value.old_password,
      new_password: formSenha.value.new_password
    });
    alert('Senha alterada com sucesso!');
    formSenha.value = { old_password: '', new_password: '', confirm_password: '' };
  } catch (err) {
    console.error("Erro ao alterar senha:", err.response?.data || err);
    const mensagemErro = err.response?.data?.detail || 'Erro ao alterar senha. Verifique a senha atual.';
    alert(mensagemErro);
  }
};
</script>

<template>
  <div class="perfil-container">
    <header class="perfil-header">
      <div>
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais, foto e credenciais de acesso.</p>
      </div>
      <LightButton label="← Voltar ao Painel" @click="router.push('/usuario-hub')" />
    </header>

    <div v-if="loading" class="loader-box">Carregando dados da conta...</div>
    <div v-if="erroMensagem" class="erro-box">{{ erroMensagem }}</div>

    <div v-if="!loading" class="perfil-grid">
      <!-- Informações Pessoais -->
      <div class="card-seccao">
        <h2>Informações Pessoais</h2>

        <!-- Bloco da Foto de Perfil -->
        <div class="foto-perfil-wrapper">
          <div class="avatar-preview">
            <img v-if="fotoPreview" :src="fotoPreview" alt="Foto de Perfil" />
            <span v-else>Sem Foto</span>
          </div>
          <div class="upload-controls">
            <label class="btn-upload">
              Escolher Foto
              <input type="file" accept="image/*" @change="aoSelecionarFoto" hidden />
            </label>
            <span class="file-name" v-if="arquivoFoto">{{ arquivoFoto.name }}</span>
          </div>
        </div>

        <form @submit.prevent="salvarPerfil" class="form-perfil">
          <div class="input-group">
            <label>Utilizador (Username)</label>
            <BaseInput v-model="formPerfil.username" placeholder="Nome de utilizador" />
          </div>
          <div class="input-group">
            <label>Email</label>
            <BaseInput v-model="formPerfil.email" placeholder="O seu email" disabled />
          </div>
          <div class="input-row">
            <div class="input-group">
              <label>Nome</label>
              <BaseInput v-model="formPerfil.first_name" placeholder="Nome" />
            </div>
            <div class="input-group">
              <label>Sobrenome</label>
              <BaseInput v-model="formPerfil.last_name" placeholder="Sobrenome" />
            </div>
          </div>
          <div class="btn-submit-wrapper">
            <DarkButton label="Salvar Alterações" type="submit" />
          </div>
        </form>
      </div>

      <!-- Segurança e Senha -->
      <div class="card-seccao">
        <h2>Segurança e Senha</h2>
        <form @submit.prevent="alterarSenha" class="form-perfil">
          <div class="input-group">
            <label>Senha Atual</label>
            <BaseInput type="password" v-model="formSenha.old_password" placeholder="••••••••" />
          </div>
          <div class="input-group">
            <label>Nova Senha</label>
            <BaseInput type="password" v-model="formSenha.new_password" placeholder="••••••••" />
          </div>
          <div class="input-group">
            <label>Confirmar Nova Senha</label>
            <BaseInput type="password" v-model="formSenha.confirm_password" placeholder="••••••••" />
          </div>
          <div class="btn-submit-wrapper">
            <DarkButton label="Atualizar Senha" type="submit" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perfil-container {
  padding: 40px;
  background: #f2f2f2;
  min-height: 100vh;
  font-family: sans-serif;
  width: 100%;
  box-sizing: border-box;
}
.perfil-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}
.perfil-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  text-transform: uppercase;
}
.perfil-header p {
  margin-top: 6px;
  color: #666;
}
.perfil-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 25px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}
.card-seccao {
  background: #fff;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}
.card-seccao h2 {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 20px;
  border-left: 4px solid #111;
  padding-left: 8px;
  text-transform: uppercase;
}
.foto-perfil-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  background: #fafafa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
}
.avatar-preview {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 0.7rem;
  color: #666;
  text-align: center;
  border: 2px solid #ccc;
}
.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.btn-upload {
  background: #141414;
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
  display: inline-block;
  text-align: center;
}
.btn-upload:hover {
  background: #333;
}
.file-name {
  font-size: 0.8rem;
  color: #666;
}
.form-perfil {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}
.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.btn-submit-wrapper {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
.loader-box, .erro-box {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  color: #d9534f;
  font-weight: 600;
}
.loader-box {
  color: #666;
  font-style: italic;
}
</style>