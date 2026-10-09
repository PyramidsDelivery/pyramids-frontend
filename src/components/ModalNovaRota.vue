<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useFreteStore } from '../stores/freteStore';

const emit = defineEmits(['rota-criada', 'close']);
const freteStore = useFreteStore();

const salvando = ref(false);
const form = ref({
  ponto_inicial: '',
  ponto_final: ''
});

let map = null;
let markerOrigem = null;
let markerDestino = null;

// Garante o carregamento do CSS do Leaflet
if (!document.getElementById('leaflet-css')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

const inicializarMapa = () => {
  if (typeof L === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = montarInstanciaMapa;
    document.head.appendChild(script);
  } else {
    montarInstanciaMapa();
  }
};

const montarInstanciaMapa = () => {
  if (map) {
    map.remove();
    map = null;
  }

  setTimeout(() => {
    const container = document.getElementById('mapa-modal');
    if (!container) return;

    map = L.map(container, {
      zoomControl: true,
      attributionControl: true
    }).setView([-26.3044, -48.8464], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Múltiplos delays para invalidar o tamanho assim que o painel do passo estiver visível
    [50, 150, 300, 600].forEach((ms) => {
      setTimeout(() => {
        if (map) map.invalidateSize(true);
      }, ms);
    });

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      if (markerOrigem) markerOrigem.setLatLng(e.latlng);
      else markerOrigem = L.marker(e.latlng, { title: 'Origem' }).addTo(map);
      
      form.value.ponto_inicial = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const endereco = await obterNomeLugar(lat, lng);
      if (endereco) form.value.ponto_inicial = endereco;
    });

    map.on('contextmenu', async (e) => {
      const { lat, lng } = e.latlng;
      if (markerDestino) markerDestino.setLatLng(e.latlng);
      else markerDestino = L.marker(e.latlng, { title: 'Destino' }).addTo(map);

      form.value.ponto_final = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const endereco = await obterNomeLugar(lat, lng);
      if (endereco) form.value.ponto_final = endereco;
    });
  }, 100);
};

const obterNomeLugar = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
    const data = await res.json();
    return data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : null;
  } catch (err) {
    return null;
  }
};

const buscarEndereco = async (tipo) => {
  const busca = tipo === 'inicial' ? form.value.ponto_inicial : form.value.ponto_final;
  if (!busca.trim()) return alert("Digite um endereço para buscar!");

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busca)}&limit=1`);
    const data = await res.json();
    
    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const coords = [parseFloat(lat), parseFloat(lon)];
      
      if (map) {
        map.setView(coords, 14);
        map.invalidateSize(true);
      }

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
  const novaRotaObj = await freteStore.criarRota({
    ponto_inicial: form.value.ponto_inicial,
    ponto_final: form.value.ponto_final
  });
  salvando.value = false;

  if (novaRotaObj) {
    emit('rota-criada', novaRotaObj.id);
  } else {
    alert("Erro ao salvar a rota.");
  }
};

onMounted(async () => {
  await nextTick();
  inicializarMapa();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="modal-corpo-grid">
    <form @submit.prevent="handleSalvarRota" class="form-modal">
      <div class="form-group">
        <label for="ponto_inicial">Origem (Ponto Inicial):</label>
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
        <label for="ponto_final">Destino (Ponto Final):</label>
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
        <button type="button" class="btn-secondary" @click="emit('close')">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="salvando">
          {{ salvando ? 'Gravando...' : 'Gravar Rota e Avançar' }}
        </button>
      </div>
    </form>

    <div class="mapa-container-modal">
      <div id="mapa-modal"></div>
    </div>
  </div>
</template>

<style scoped>
.modal-corpo-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
  margin-top: 10px;
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
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}
.busca-input-container {
  display: flex;
  gap: 6px;
}
.busca-input-container input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}
.btn-buscar {
  background: #f0f0f0;
  border: 1px solid #ccc;
  padding: 0 12px;
  border-radius: 6px;
  cursor: pointer;
}
.mapa-container-modal {
  background: #e5e3df;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 400px;
  width: 100%;
  position: relative;
  overflow: hidden;
}
#mapa-modal {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0;
  left: 0;
  z-index: 10;
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
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.btn-secondary {
  background: #f5f5f5;
  border: 1px solid #ccc;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
}
</style>