import axios from 'axios';

const api = axios.create({
  baseURL: 'https://costasbrabo.class.fabricadesoftware.ifc.edu.br', // URL do seu Django
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Token ${token}`;
}

export default api;