import { defineStore } from 'pinia';
import api from '../services/api';

export const useDataStore = defineStore('data', {
  state: () => ({
    items: [],
  }),
  actions: {
    async fetchItems() {
      try {
        const response = await api.get('seus-objetos/');
        this.items = response.data;
      } catch (error) {
        console.error("Erro na API", error);
      }
    }
  }
});