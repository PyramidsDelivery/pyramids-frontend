import { defineStore } from 'pinia';
import api from '../services/api';

export const useDataStore = defineStore('data', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
    items: [],
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await api.post('login/', { 
        username: email, 
        password: password 
      });
        this.token = response.data.token;
        localStorage.setItem('token', this.token);
        api.defaults.headers.common['Authorization'] = `Token ${this.token}`;
        return true;
      } catch (error) {
        console.error("Erro no login", error);
        return false;
      }
    },
    logout() {
      this.token = '';
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }
});