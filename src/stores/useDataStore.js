import { defineStore } from 'pinia';
import api from '../services/api';

export const useDataStore = defineStore('data', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    isStaff: localStorage.getItem('is_staff') === 'true',
    isSuperuser: localStorage.getItem('is_superuser') === 'true',
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

        const { token, is_staff, is_superuser } = response.data;

        this.token = token;
        this.isStaff = is_staff;
        this.isSuperuser = is_superuser;

        localStorage.setItem('token', token);
        localStorage.setItem('is_staff', is_staff);
        localStorage.setItem('is_superuser', is_superuser);
        api.defaults.headers.common['Authorization'] = `Token ${this.token}`;
        
        return true;
      } catch (error) {
        console.error("Erro no login", error);
        return false;
      }
    },

    // --- NOVA ACTION DE CADASTRO ---
    async cadastro(nome, email, password) {
      try {
        // Envia para o endpoint 'registro/' conforme definido no seu urls.py
        await api.post('registro/', { 
         
          email: email, 
          name: nome,      // Campo necessário para preencher o Personal Info
          password: password 
        });
        
        return true;
      } catch (error) {
        // Log detalhado para identificar erros de validação do Django
        console.error("Erro no cadastro:", error.response?.data || error);
        return false;
      }
    },
    // -------------------------------

    logout() {
      this.token = '';
      this.isStaff = false;
      this.isSuperuser = false;

      localStorage.removeItem('token');
      localStorage.removeItem('is_staff');
      localStorage.removeItem('is_superuser');

      delete api.defaults.headers.common['Authorization'];
    }
  }
});