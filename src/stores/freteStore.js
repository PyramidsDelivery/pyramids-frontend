import { defineStore } from 'pinia';
import api from '../services/api';

export const useFreteStore = defineStore('frete', {
  state: () => ({
    listaFretes: [],
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
    async carregarFretes() {
      this.loading = true;
      try {
        const response = await api.get('fretes/?limit=1000');
        this.listaFretes = response.data.results || response.data;
      } catch (err) {
        console.error("Erro ao carregar fretes:", err);
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

    // 🔥 CORREÇÃO: Forçar o tratamento e envio correto do campo 'distancia'
    // 🔥 CORREÇÃO DA ROTA: Forçar o tratamento e envio correto do campo 'distancia'
        async criarRota(dadosRota) {
  try {
    const payload = {
      ponto_inicial: dadosRota.ponto_inicial,
      ponto_final: dadosRota.ponto_final
    };

    // Certifique-se de que a URL termine estritamente com '/'
    const resposta = await api.post('/rotas/', payload);
    return true;
  } catch (erro) {
    console.error("Erro ao criar rota no backend:", erro.response?.data || erro);
    return false;
  }
}, // 🔥 CORREÇÃO DO FRETE: Ajustado para usar 'moeda' em vez de 'tipo_moeda'
    async criarFrete(dadosFrete) {
      try {
        const payloadFormatado = {
          carga: parseInt(dadosFrete.carga),
          motorista: parseInt(dadosFrete.motorista),
          veiculo: parseInt(dadosFrete.veiculo),
          rota: parseInt(dadosFrete.rota),
          valor_frete: parseFloat(dadosFrete.valor_frete),
          
          // Alterado de 'tipo_moeda' para 'moeda' (exatamente igual à Model do Django)
          // Se o front enviar "Reais (R$)", limpe para enviar apenas "Reais", "Euro" ou "Dolar"
          moeda: dadosFrete.moeda || 'Reais', 
          
          status: dadosFrete.status || 'PENDENTE',
          
          // Campos opcionais da model mapeados como nulos se não forem preenchidos
          ultima_localizacao: dadosFrete.ultima_localizacao || null,
          latitude: dadosFrete.latitude ? parseFloat(dadosFrete.latitude) : null,
          longitude: dadosFrete.longitude ? parseFloat(dadosFrete.longitude) : null
        };

        await api.post('fretes/', payloadFormatado);
        await this.carregarFretes(); 
        return true;
      } catch (err) {
        console.error("Erro ao criar frete no backend:", err.response?.data || err);
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
    }
  }
});