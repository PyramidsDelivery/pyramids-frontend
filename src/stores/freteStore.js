import { defineStore } from 'pinia';
import api from '../services/api';

export const useFreteStore = defineStore('frete', {
  state: () => ({
    listaFretes: [],
    loading: false,
    erro: null,
    detalheCarga: null,
    detalheMotorista: null
  }),
  actions: {
    async carregarFretes() {
      this.loading = true;
      try {
        const response = await api.get('fretes/');
        this.listaFretes = response.data.results;
      } catch (err) {
        console.error("Erro ao carregar fretes", err);
      } finally {
        this.loading = false;
      }
    },
    async buscarDetalheCarga(id) {
      try {
        const response = await api.get(`cargas/${id}/`);
        this.detalheCarga = response.data;
      } catch (err) {
        console.error("Erro ao carregar detalhes da carga", err);
      }
    },
    async buscarDetalheMotorista(id) {
      try {
        const response = await api.get(`motoristas/${id}/`);
        this.detalheMotorista = response.data;
      } catch (err) {
        console.error("Erro ao carregar detalhes do motorista", err);
      }
    }
  }
});