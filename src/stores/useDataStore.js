import { defineStore } from 'pinia';
import api from '../services/api';

export const useDataStore = defineStore('data', {
  state: () => {
    const token = localStorage.getItem('token') || '';
    // Se já houver um token guardado, configura o Axios automaticamente no boot do app
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
    }
    
    return {
      token: token,
      isStaff: localStorage.getItem('is_staff') === 'true',
      isSuperuser: localStorage.getItem('is_superuser') === 'true',
      user: null,
      items: [],
    };
  },
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

    async cadastro(nome, email, password) {
      try {
        await api.post('registro/', { 
          email: email, 
          name: nome,     
          password: password 
        });
        
        return true;
      } catch (error) {
        console.error("Erro no cadastro:", error.response?.data || error);
        return false;
      }
    },

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