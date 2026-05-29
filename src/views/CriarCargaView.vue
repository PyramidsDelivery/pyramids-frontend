<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api'; // Certifique-se de que o caminho para sua api está correto
import DarkButton from '../components/DarkButton.vue';

const router = useRouter();

const form = ref({
  descricao: '',
  peso: '',
  unidade: 'KG',
  valor: '',
  moeda: 'Reais'
});

const fotoArquivo = ref(null);

// Captura a foto que o usuário selecionou no computador/celular
const handleFileUpload = (event) => {
  const arquivo = event.target.files[0];
  if (arquivo) {
    fotoArquivo.value = arquivo;
  }
};

const finalizarCadastro = async () => {
  if (!form.value.descricao || !form.value.peso || !form.value.valor) {
    alert("Por favor, preencha os campos obrigatórios (Descrição, Peso e Valor).");
    return;
  }

  // IMPORTANTE: Como estamos enviando um arquivo de imagem, usamos FormData em vez de JSON bruto
  const formData = new FormData();
  formData.append('descricao', form.value.descricao);
  formData.append('peso', form.value.peso);
  formData.append('unidade', form.value.unidade);
  formData.append('valor', form.value.valor);
  formData.append('moeda', form.value.moeda);
  
  if (fotoArquivo.value) {
    formData.append('foto', fotoArquivo.value);
  }

  try {
    // Passamos o Header multipart/form-data avisando a API que vai uma foto junto
    await api.post('cargas/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert("Carga cadastrada com sucesso!");
    router.back(); // Retorna para a página anterior após salvar
  } catch (error) {
    console.error("Erro ao cadastrar carga:", error.response?.data || error);
    alert("Erro ao cadastrar carga. Verifique os dados inseridos.");
  }
};
</script>

<template>
  <div class="admin-page">
    <div class="header-actions">
      <button @click="router.back()" class="btn-voltar">← Voltar</button>
      <h2>Cadastrar Nova Carga</h2>
    </div>

    <div class="form-container">
      <label>Descrição do Produto:</label>
      <input type="text" v-model="form.descricao" placeholder="Ex: Caixas de Componentes Eletrônicos">

      <div class="row-group">
        <div class="field">
          <label>Peso:</label>
          <input type="number" v-model="form.peso" placeholder="0.00" step="0.01">
        </div>
        <div class="field">
          <label>Unidade de Medida:</label>
          <select v-model="form.unidade">
            <option value="KG">Quilogramas (KG)</option>
            <option value="TON">Toneladas (TON)</option>
            <option value="G">Gramas (G)</option>
          </select>
        </div>
      </div>

      <div class="row-group">
        <div class="field">
          <label>Valor Estimado:</label>
          <input type="number" v-model="form.valor" placeholder="0.00" step="0.01">
        </div>
        <div class="field">
          <label>Moeda:</label>
          <select v-model="form.moeda">
            <option value="Reais">Reais (R$)</option>
            <option value="Euro">Euro (€)</option>
            <option value="Dolar">Dólar ($)</option>
          </select>
        </div>
      </div>

      <label>Foto da Carga (Opcional):</label>
      <input type="file" @change="handleFileUpload" accept="image/*" class="file-input">

      <div class="button-group">
        <DarkButton label="Gravar Carga no Sistema" @click="finalizarCadastro" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.btn-voltar {
  background: none;
  border: 1px solid #ccc;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-voltar:hover {
  background: #eee;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.row-group {
  display: flex;
  gap: 15px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  font-weight: bold;
  color: #444;
  margin-bottom: -10px;
}

select, input {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.file-input {
  padding: 8px;
  background: #fdfdfd;
  border: 1px dashed #ccc;
  cursor: pointer;
}

.button-group {
  margin-top: 10px;
}
</style>