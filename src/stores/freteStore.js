import { defineStore } from 'pinia';
import api from '../services/api';

export const useFreteStore = defineStore('frete', {
  state: () => ({
    listaFretes: [],
    loading: false,
    erro: null,
    detalheCarga: null,
    detalheMotorista: null,
    // Inicialização essencial para o formulário de cadastro não quebrar
    opcoes: {
      cargas: [],
      motoristas: [],
      veiculos: [],
      rotas: []
    }
  }),

  actions: {
    // 1. Carrega todos os fretes para a tabela principal
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

    // 2. Busca as opções para os campos de seleção (Selects)
    async buscarOpcoesCadastro() {
      this.loading = true;
      try {
        // Faz chamadas simultâneas para otimizar o carregamento
        const [cargas, motoristas, veiculos, rotas] = await Promise.all([
          api.get('cargas/'),
          api.get('motoristas/'),
          api.get('veiculos/'),
          api.get('rotas/')
        ]);

        // Atualiza o objeto 'opcoes' com os dados reais do backend
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

    // 3. Envia o novo frete para o servidor
    async criarFrete(dadosFrete) {
      try {
        // Envia o objeto 'form' com os IDs selecionados
        await api.post('fretes/', dadosFrete);
        // Recarrega a lista para mostrar o novo item na tabela
        await this.carregarFretes(); 
        return true;
      } catch (err) {
        console.error("Erro ao criar frete:", err.response?.data || err);
        return false;
      }
    },

    // 4. Funções para carregar detalhes (usadas em Modais ou Cards)
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