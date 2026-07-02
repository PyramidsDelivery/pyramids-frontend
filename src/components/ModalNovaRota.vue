
<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { useFreteStore } from '../stores/freteStore';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);
const freteStore = useFreteStore();

const salvando = ref(false);
const form = ref({
  ponto_inicial: '',
  ponto_final: ''
});

let map = null;
let markerOrigem = null;
let markerDestino = null;

// Carrega os estilos do Leaflet dinamicamente se não estiverem no index.html
if (!document.getElementById('leaflet-css')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

// Inicializa o mapa Leaflet
const inicializarMapa = () => {
  if (map) return;

  // Centralizado por padrão em uma região central/SC (pode ajustar para onde preferir)
  map = L.map('mapa-modal').setView([-26.30, -48.84], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Clique Esquerdo -> Define Origem
  map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    if (markerOrigem) markerOrigem.setLatLng(e.latlng);
    else markerOrigem = L.marker(e.latlng, { title: 'Origem' }).addTo(map);
    
    form.value.ponto_inicial = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const endereco = ref(await obterNomeLugar(lat, lng));
    if (endereco.value) form.value.ponto_inicial = endereco.value;
  });

  // Clique Direito -> Define Destino
  map.on('contextmenu', async (e) => {
    const { lat, lng } = e.latlng;
    if (markerDestino) markerDestino.setLatLng(e.latlng);
    else markerDestino = L.marker(e.latlng, { title: 'Destino' }).addTo(map);

    form.value.ponto_final = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const endereco = ref(await obterNomeLugar(lat, lng));
    if (endereco.value) form.value.ponto_final = endereco.value;
  });
};

// Transforma Coordenadas do Clique em Nome de Rua/Cidade (Geocoding Reverso)
const obterNomeLugar = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
    const data = await res.json();
    return data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : null;
  } catch (err) {
    return null;
  }
};

// Transforma Texto digitado em Coordenadas e move o mapa (Geocoding Direto)
const buscarEndereco = async (tipo) => {
  const busca = tipo === 'inicial' ? form.value.ponto_inicial : form.value.ponto_final;
  if (!busca.trim()) return alert("Digite um endereço para buscar!");

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busca)}&limit=1`);
    const data = await res.json();
    
    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const coords = [parseFloat(lat), parseFloat(lon)];
      
      map.setView(coords, 14);

      if (tipo === 'inicial') {
        form.value.ponto_inicial = display_name.split(',').slice(0, 3).join(',');
        if (markerOrigem) markerOrigem.setLatLng(coords);
        else markerOrigem = L.marker(coords).addTo(map);
      } else {
        form.value.ponto_final = display_name.split(',').slice(0, 3).join(',');
        if (markerDestino) markerDestino.setLatLng(coords);
        else markerDestino = L.marker(coords).addTo(map);
      }
    } else {
      alert("Endereço não encontrado no mapa.");
    }
  } catch (err) {
    console.error("Erro na busca do endereço:", err);
  }
};
const handleSalvarRota = async () => {
  if (!form.value.ponto_inicial.trim() || !form.value.ponto_final.trim()) {
    alert("Preencha ou selecione a origem e o destino!");
    return;
  }

  salvando.value = true;
  
  const sucesso = await freteStore.criarRota({
    ponto_inicial: form.value.ponto_inicial,
    ponto_final: form.value.ponto_final
  });
  
  salvando.value = false;

  if (sucesso) {
    alert("Rota criada com sucesso!");
    fecharModal();
  } else {
    alert("Erro ao salvar a rota.");
  }
};
const fecharModal = () => {
  form.value.ponto_inicial = '';
  form.value.ponto_final = '';
  if (markerOrigem) { markerOrigem.remove(); markerOrigem = null; }
  if (markerDestino) { markerDestino.remove(); markerDestino = null; }
  if (map) { map.remove(); map = null; }
  emit('close');
};

// Monitora a abertura do modal para renderizar o Leaflet no tempo correto do DOM
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    // Garante que o script global do Leaflet está disponível
    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = inicializarMapa;
      document.head.appendChild(script);
    } else {
      inicializarMapa();
    }
  }
});

onUnmounted(() => {
  if (map) map.remove();
});
</script>


<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="fecharModal">
    <div class="modal-content-larga">
      <div class="modal-header">
        <h3> Cadastrar Nova Rota Interativa</h3>
        <button class="btn-close" @click="fecharModal">×</button>
      </div>
      <hr />

      <div class="modal-corpo-grid">
        <form @submit.prevent="handleSalvarRota" class="form-modal">
          <div class="form-group">
            <label for="ponto_inicial"> Origem (Ponto Inicial):</label>
            <div class="busca-input-container">
              <input 
                type="text" 
                id="ponto_inicial" 
                v-model="form.ponto_inicial" 
                placeholder="Digite ou clique no mapa"
                required
              />
              <button type="button" class="btn-buscar" @click="buscarEndereco('inicial')">🔍</button>
            </div>
          </div>

          <div class="form-group">
            <label for="ponto_final">🏁 Destino (Ponto Final):</label>
            <div class="busca-input-container">
              <input 
                type="text" 
                id="ponto_final" 
                v-model="form.ponto_final" 
                placeholder="Digite ou clique no mapa"
                required
              />
              <button type="button" class="btn-buscar" @click="buscarEndereco('final')">🔍</button>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="fecharModal">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="salvando">
              {{ salvando ? 'Gravando...' : 'Gravar Rota no Sistema' }}
            </button>
          </div>
        </form>

        <div class="mapa-container-modal">
          <div id="mapa-modal" class="mapa-elemento"></div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500;
}

.modal-content-larga {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 90vw;
  max-width: 950px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
}

.modal-corpo-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
  margin-top: 15px;
}

.form-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.busca-input-container {
  display: flex;
  gap: 6px;
}

.busca-input-container input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
}

.btn-buscar {
  background: #f0f0f0;
  border: 1px solid #ccc;
  padding: 0 12px;
  border-radius: 4px;
  cursor: pointer;
}

.instrucoes-mapa {
  background: #f9f9f9;
  border-left: 4px solid #1a1a1a;
  padding: 10px;
  font-size: 0.85rem;
  color: #555;
  border-radius: 4px;
}

.mapa-container-modal {
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 6px;
  height: 380px;
  overflow: hidden;
}

.mapa-elemento {
  width: 100%;
  height: 100%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: auto;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f5;
  border: 1px solid #ccc;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>