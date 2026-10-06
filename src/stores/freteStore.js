import { defineStore } from 'pinia';
import api from '../services/api';

export const useFreteStore = defineStore('frete', {
  state: () => ({
    fretesCliente: [],
    fretesMotorista: [],
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
    async carregarFretes(tipo = 'cliente', params = {}) {
      this.loading = true;
      try {
        const queryParams = new URLSearchParams({ tipo, limit: 1000, ...params });
        const response = await api.get(`fretes/?${queryParams.toString()}`);
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
        const response = await api.post('/rotas/', {
          ponto_inicial: dadosRota.ponto_inicial,
          ponto_final: dadosRota.ponto_final
        });
        return response.data;
      } catch (erro) {
        console.error("Erro ao criar rota:", erro.response?.data || erro);
        return null;
      }
    },

async criarFrete(dadosFrete) {
      try {
        if (!dadosFrete) {
          throw new Error("Dados do frete não fornecidos.");
        }

        const payloadFormatado = {
          carga: dadosFrete.carga ? parseInt(dadosFrete.carga) : null,
          motorista: dadosFrete.motorista ? parseInt(dadosFrete.motorista) : null,
          veiculo: dadosFrete.veiculo ? parseInt(dadosFrete.veiculo) : null,
          rota: dadosFrete.rota ? parseInt(dadosFrete.rota) : null,
          valor_frete: dadosFrete.valor_frete ? parseFloat(dadosFrete.valor_frete) : 0,
          moeda: dadosFrete.moeda || 'Reais',
          status: dadosFrete.status || 'PENDENTE',
          ultima_localizacao: dadosFrete.ultima_localizacao || null,
          latitude: dadosFrete.latitude ? parseFloat(dadosFrete.latitude) : null,
          longitude: dadosFrete.longitude ? parseFloat(dadosFrete.longitude) : null
        };

        const response = await api.post('fretes/', payloadFormatado);
        
        // Atualiza a lista dependendo do contexto atual
        await this.carregarFretes('cliente'); 
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Erro ao criar frete:", err.response?.data || err);
        const errorData = err.response?.data;
        let errorMsg = "Erro ao criar frete.";
        
        if (typeof errorData === 'object' && errorData !== null) {
          const firstKey = Object.keys(errorData)[0];
          const firstVal = errorData[firstKey];
          errorMsg = Array.isArray(firstVal) ? firstVal[0] : (typeof firstVal === 'string' ? firstVal : JSON.stringify(errorData));
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (err.message) {
          errorMsg = err.message;
        }

        return { success: false, message: errorMsg };
      }
    },

    async atualizarFreteMotorista(id, status, ultimaLocalizacao) {
      try {
        const payload = {};
        if (status) payload.status = status;
        if (ultimaLocalizacao !== undefined) payload.ultima_localizacao = ultimaLocalizacao;

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