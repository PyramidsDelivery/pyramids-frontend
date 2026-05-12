import { defineStore } from 'pinia';
import api from '../services/api';

export const useDataStore = defineStore('data', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    // Adicionamos estados para os cargos, recuperando do localStorage para persistir no F5
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

        // 1. Extrair os dados da resposta
        const { token, is_staff, is_superuser } = response.data;

        // 2. Atualizar o estado da Store
        this.token = token;
        this.isStaff = is_staff;
        this.isSuperuser = is_superuser;

        // 3. Salvar no localStorage para persistência
        localStorage.setItem('token', token);
        localStorage.setItem('is_staff', is_staff);
        localStorage.setItem('is_superuser', is_superuser);

        // 4. Configurar o header global do axios
        api.defaults.headers.common['Authorization'] = `Token ${this.token}`;
        
        return true;
      } catch (error) {
        console.error("Erro no login", error);
        return false;
      }
    },
    
    logout() {
      // Limpar estados
      this.token = '';
      this.isStaff = false;
      this.isSuperuser = false;

      // Limpar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('is_staff');
      localStorage.removeItem('is_superuser');

      // Limpar header do axios
      delete api.defaults.headers.common['Authorization'];
    }
  }
});