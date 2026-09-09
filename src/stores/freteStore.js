import { defineStore } from 'pinia';
import api from '../services/api';

export const useFreteStore = defineStore('frete', {
  state: () => ({
    fretesCliente: [],    // 📦 Guarda apenas os fretes solicitados
    fretesMotorista: [],  // 🚚 Guarda apenas os fretes a realizar
    listaFretes: [],     // Fallback / Visão geral
    loading: false,
    erro: null,
    detalheCarga: null,
    detalheMotorista: null,
    opcoes: {
      cargas: [],
      motoristas: [],
      veiculos: [],
      rotas: []
    }
  }),

  actions: {
    // 🔥 Separa os dados recebidos por papel (cliente x motorista) para não misturar no estado
    async carregarFretes(tipo = 'cliente') {
      this.loading = true;
      try {
        const response = await api.get(`fretes/?tipo=${tipo}&limit=1000`);
        const dados = response.data.results || response.data;

        if (tipo === 'motorista') {
          this.fretesMotorista = dados;
        } else {
          this.fretesCliente = dados;
        }
        this.listaFretes = dados;
      } catch (err) {
        console.error(`Erro ao carregar fretes (${tipo}):`, err);
        this.erro = "Não foi possível carregar a lista de fretes.";
      } finally {
        this.loading = false;
      }
    },

    async buscarOpcoesCadastro() {
      this.loading = true;
      try {
        const [cargas, motoristas, veiculos, rotas] = await Promise.all([
          api.get('cargas/'),
          api.get('motoristas/'),
          api.get('veiculos/'),
          api.get('rotas/')
        ]);

        this.opcoes = {
          cargas: cargas.data.results || cargas.data,
          motoristas: motoristas.data.results || motoristas.data,
          veiculos: veiculos.data.results || veiculos.data,
          rotas: rotas.data.results || rotas.data
        };
      } catch (err) {
        console.error("Erro ao buscar opções para cadastro:", err);
      } finally {
        this.loading = false;
      }
    },

    async criarRota(dadosRota) {
      try {
        const payload = {
          ponto_inicial: dadosRota.ponto_inicial,
          ponto_final: dadosRota.ponto_final
        };
        await api.post('/rotas/', payload);
        return true;
      } catch (erro) {
        console.error("Erro ao criar rota:", erro.response?.data || erro);
        return false;
      }
    },

    async criarFrete(dadosFrete) {
      try {
        const payloadFormatado = {
          carga: parseInt(dadosFrete.carga),
          motorista: parseInt(dadosFrete.motorista),
          veiculo: parseInt(dadosFrete.veiculo),
          rota: parseInt(dadosFrete.rota),
          valor_frete: parseFloat(dadosFrete.valor_frete),
          moeda: dadosFrete.moeda || 'Reais',
          status: dadosFrete.status || 'PENDENTE',
          ultima_localizacao: dadosFrete.ultima_localizacao || null,
          latitude: dadosFrete.latitude ? parseFloat(dadosFrete.latitude) : null,
          longitude: dadosFrete.longitude ? parseFloat(dadosFrete.longitude) : null
        };

        await api.post('fretes/', payloadFormatado);
        await this.carregarFretes('cliente'); 
        return true;
      } catch (err) {
        console.error("Erro ao criar frete:", err.response?.data || err);
        return false;
      }
    },

    async buscarDetalheCarga(id) {
      try {
        const response = await api.get(`cargas/${id}/`);
        this.detalheCarga = response.data;
      } catch (err) {
        console.error("Erro ao carregar detalhe da carga:", err);
      }
    },

    async buscarDetalheMotorista(id) {
      try {
        const response = await api.get(`motoristas/${id}/`);
        this.detalheMotorista = response.data;
      } catch (err) {
        console.error("Erro ao carregar detalhe do motorista:", err);
      }
    },

    async atualizarFreteMotorista(id, status, ultimaLocalizacao) {
  try {
    const payload = {};
    if (status) payload.status = status;
    if (ultimaLocalizacao) payload.ultima_localizacao = ultimaLocalizacao;

    // Adiciona ?tipo=motorista para garantir que caia na consulta do motorista
    await api.patch(`fretes/${id}/?tipo=motorista`, payload);
    await this.carregarFretes('motorista');
    return true;
  } catch (err) {
    console.error("Erro ao atualizar frete:", err.response?.data || err);
    return false;
  }
}
  }
});