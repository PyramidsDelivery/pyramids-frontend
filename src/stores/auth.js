import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Tenta recuperar o token ao iniciar a aplicação
    token: localStorage.getItem('access_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    userEmail: localStorage.getItem('user_email') || null,
  }),

  actions: {
    async login(email, password) {
      try {
        const response = await api.post('token/', { 
          username: email,
          password: password 
        });

        // Salva os tokens e o estado
        this.token = response.data.access;
        this.isAuthenticated = true;
        this.userEmail = email;

        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user_email', email);

        return { success: true };
      } catch (error) {
        console.error("Erro na autenticação:", error.response?.data);
        return { 
          success: false, 
          message: error.response?.data?.detail || "Erro ao realizar login" 
        };
      }
    },

    logout() {
      this.token = null;
      this.isAuthenticated = false;
      this.userEmail = null;
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
      window.location.href = '/login';
    }
  }
});