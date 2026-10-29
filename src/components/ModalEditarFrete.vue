<script setup>
import { ref, watch, nextTick } from "vue";
import DarkButton from "./DarkButton.vue";
import LightButton from "./LightButton.vue";
import { useFreteStore } from "../stores/freteStore";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const props = defineProps({ isOpen: Boolean, frete: Object, opcoes: Object });
const emit = defineEmits(["close", "salvo"]);
const freteStore = useFreteStore();

const freteLocal = ref({});
let mapa = null;
let marcadorMotorista = null;

// Função auxiliar para extrair o ID com segurança (seja objeto ou número)
const extrairId = (campo) => {
  if (!campo) return "";
  return typeof campo === "object" ? campo.id : campo;
};

watch(
  () => props.isOpen,
  async (val) => {
    if (val && props.frete) {
      // Normaliza os campos relacionais para conterem apenas os IDs numéricos
      freteLocal.value = {
        ...props.frete,
        carga: extrairId(props.frete.carga),
        motorista: extrairId(props.frete.motorista),
        veiculo: extrairId(props.frete.veiculo),
        rota: extrairId(props.frete.rota),
        valor_frete: props.frete.valor_frete ? String(props.frete.valor_frete).replace(',', '.') : ''
      };
      await nextTick();
      inicializarMapa();
      setTimeout(() => mapa?.invalidateSize(), 250);
    } else {
      if (mapa) {
        mapa.remove();
        mapa = null;
        marcadorMotorista = null;
      }
    }
  },
);

const inicializarMapa = () => {
  if (mapa) {
    mapa.remove();
    mapa = null;
    marcadorMotorista = null;
  }
  const temCoord = freteLocal.value.latitude && freteLocal.value.longitude;
  const lat = temCoord ? freteLocal.value.latitude : -15.7801;
  const lng = temCoord ? freteLocal.value.longitude : -47.9292;

  mapa = L.map("mapa-rastreio").setView([lat, lng], temCoord ? 13 : 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(mapa);

  if (temCoord) {
    marcadorMotorista = L.marker([lat, lng]).addTo(mapa);
    if (freteLocal.value.ultima_localizacao) {
      marcadorMotorista
        .bindPopup(`<b>Local:</b><br>${freteLocal.value.ultima_localizacao}`)
        .openPopup();
    }
  }
  mapa.on("click", (e) =>
    atualizarMarcador(e.latlng.lat, e.latlng.lng, "Nova posição"),
  );
};

const atualizarMarcador = async (lat, lng, msg) => {
  freteLocal.value.ultima_localizacao = "Buscando...";
  freteLocal.value.latitude = lat;
  freteLocal.value.longitude = lng;

  if (marcadorMotorista) marcadorMotorista.setLatLng([lat, lng]);
  else marcadorMotorista = L.marker([lat, lng]).addTo(mapa);
  mapa.setView([lat, lng], 14);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "pt-BR" } },
    );
    const dados = await res.json();
    if (dados?.address) {
      const adr = dados.address;
      const end = `${adr.road || ""}, ${adr.city || ""} - ${adr.state || ""}`;
      freteLocal.value.ultima_localizacao = end;
      marcadorMotorista.bindPopup(`<b>${msg}</b><br>${end}`).openPopup();
    } else {
      freteLocal.value.ultima_localizacao = `Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`;
    }
  } catch {
    freteLocal.value.ultima_localizacao = `Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`;
  }
};

const compartilharGps = () => {
  if (!navigator.geolocation) return alert("GPS não suportado.");
  navigator.geolocation.getCurrentPosition((pos) => {
    atualizarMarcador(
      pos.coords.latitude,
      pos.coords.longitude,
      "Minha localização atual",
    );
  });
};

const salvar = async () => {
  try {
    const valorTratado = parseFloat(String(freteLocal.value.valor_frete).replace(',', '.'));

    const payload = {
      carga: freteLocal.value.carga ? parseInt(freteLocal.value.carga) : null,
      motorista: freteLocal.value.motorista ? parseInt(freteLocal.value.motorista) : null,
      veiculo: freteLocal.value.veiculo ? parseInt(freteLocal.value.veiculo) : null,
      rota: freteLocal.value.rota ? parseInt(freteLocal.value.rota) : null,
      valor_frete: isNaN(valorTratado) ? 0 : valorTratado,
      moeda: freteLocal.value.moeda || 'Reais',
      status: freteLocal.value.status || 'Pendente',
      ultima_localizacao: freteLocal.value.ultima_localizacao || null,
      latitude: freteLocal.value.latitude ? parseFloat(freteLocal.value.latitude) : null,
      longitude: freteLocal.value.longitude ? parseFloat(freteLocal.value.longitude) : null,
    };

    console.log("Payload enviado para edição:", payload);

    const response = await api.patch(`fretes/${freteLocal.value.id}/`, payload);
    console.log("Resposta de sucesso da API:", response.data);

    await freteStore.carregarFretes('cliente');
    
    emit("salvo");
    emit("close");
  } catch (err) {
    console.error("Erro completo retornado pelo backend:", err.response?.data || err);
    alert("Erro ao salvar: " + JSON.stringify(err.response?.data || err.message));
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content modal-form">
      <h3>Editar Frete #{{ freteLocal.id }}</h3>
      <hr />
      <div class="form-grid">
        <label>Carga</label>
        <select v-model="freteLocal.carga">
          <option value="" disabled>Selecione a carga</option>
          <option v-for="c in opcoes?.cargas" :key="c.id" :value="c.id">
            {{ c.descricao }}
          </option>
        </select>

        <label>Motorista</label>
        <select v-model="freteLocal.motorista">
          <option value="" disabled>Selecione o motorista</option>
          <option v-for="m in opcoes?.motoristas" :key="m.id" :value="m.id">
            {{ m.nome }}
          </option>
        </select>

        <label>Veículo</label>
        <select v-model="freteLocal.veiculo">
          <option value="" disabled>Selecione o veículo</option>
          <option v-for="v in opcoes?.veiculos" :key="v.id" :value="v.id">
            {{ v.modelo }} ({{ v.placa }})
          </option>
        </select>

        <label>Rota</label>
        <select v-model="freteLocal.rota">
          <option value="" disabled>Selecione a rota</option>
          <option v-for="r in opcoes?.rotas" :key="r.id" :value="r.id">
            {{ r.nome || `${r.ponto_inicial} → ${r.ponto_final}` }}
          </option>
        </select>

        <label>Moeda</label>
        <select v-model="freteLocal.moeda">
          <option value="Reais">Reais (R$)</option>
          <option value="Euro">Euro (€)</option>
          <option value="Dolar">Dólar ($)</option>
        </select>

        <label>Valor</label>
        <input type="text" v-model="freteLocal.valor_frete" placeholder="0.00" />

        <label>Status</label>
        <select v-model="freteLocal.status">
          <option value="Pendente">Pendente</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Entregue">Entregue</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <label>Localização</label>
        <input type="text" v-model="freteLocal.ultima_localizacao" />
      </div>

      <div class="mapa-secao">
        <label class="mapa-titulo">Rastreamento por Mapa Interativo</label>
        <div id="mapa-rastreio" class="mapa-container"></div>
        <div class="gps-btn-wrapper">
          <LightButton
            label=" Compartilhar Localização Atual"
            @click="compartilharGps"
          />
        </div>
      </div>

      <div class="modal-actions">
        <DarkButton label="Salvar Alterações" @click="salvar" />
        <LightButton label="Cancelar" @click="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 20, 20, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}
.form-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}
.form-grid input,
.form-grid select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
}
.mapa-container {
  width: 100%;
  height: 240px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  z-index: 1;
}
.gps-btn-wrapper {
  margin-bottom: 15px;
}
.gps-btn-wrapper :deep(button) {
  width: auto;
  padding: 8px 14px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
.modal-actions :deep(button) {
  width: auto;
  padding: 8px 16px;
}
</style>