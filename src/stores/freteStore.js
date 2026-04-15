import { defineStore } from 'pinia';
import api from '../services/api'; 
export const useFreteStore = defineStore('frete', {
  state: () => ({
    listaFretes: [],
    loading: false,
    erro: null
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
  }
}
});