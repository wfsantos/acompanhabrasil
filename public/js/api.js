/**
 * Cliente de API — AcompanhaBrasil
 * 
 * Gerencia as chamadas HTTP para o backend e o token JWT efêmero.
 */

const Api = {
  getToken() {
    return sessionStorage.getItem('ab_token');
  },

  setToken(token) {
    sessionStorage.setItem('ab_token', token);
  },

  clearToken() {
    sessionStorage.removeItem('ab_token');
  },

  async validarVoluntario(cpf, dataNascimento, dadosExtras = {}) {
    const response = await fetch('/api/auth/validar-voluntario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, dataNascimento, ...dadosExtras })
    });
    return response.json();
  },

  async parseQr(qrText) {
    const response = await fetch('/api/boletins/parse-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrText })
    });
    return response.json();
  },

  async submitBoletim(formData) {
    const token = this.getToken();
    const response = await fetch('/api/boletins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },

  async getSecoes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`/api/audit/secoes?${query}`);
    return response.json();
  },

  async getSecaoDetails(id) {
    const response = await fetch(`/api/audit/secoes/${id}`);
    return response.json();
  },

  async getEstatisticas() {
    const response = await fetch('/api/audit/estatisticas');
    return response.json();
  }
};
