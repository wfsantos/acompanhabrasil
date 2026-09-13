/**
 * Validador Frontend — AcompanhaBrasil
 */

const Validator = {
  formatCpf(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  },

  isValidCpf(cpf) {
    if (!cpf) return false;
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(clean.charAt(i), 10) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.charAt(9), 10)) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(clean.charAt(i), 10) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.charAt(10), 10)) return false;

    return true;
  },

  checkMathConsistency(aptos, comparecimento, faltosos, votosTotal) {
    const apt = parseInt(aptos, 10) || 0;
    const comp = parseInt(comparecimento, 10) || 0;
    const falt = parseInt(faltosos, 10) || 0;
    const totVotos = parseInt(votosTotal, 10) || 0;

    const errors = [];

    if (apt > 0 && comp + falt !== apt) {
      errors.push(`Aptos (${apt}) deve ser igual a Comparecimento (${comp}) + Faltosos (${falt}).`);
    }

    if (comp > 0 && totVotos !== comp) {
      errors.push(`Soma dos votos (${totVotos}) deve ser igual ao Comparecimento (${comp}).`);
    }

    return {
      isConsistent: errors.length === 0,
      errors
    };
  }
};
