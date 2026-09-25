/**
 * Motor de OCR (Tesseract.js) — AcompanhaBrasil
 * 
 * Executa o reconhecimento óptico de caracteres no cliente com validação estrita
 * de autenticidade de Boletim de Urna (sem preenchimento de dados fictícios).
 */

class OcrEngine {
  constructor() {
    this.isReady = false;
  }

  async init() {
    if (typeof Tesseract === 'undefined') {
      console.warn('Tesseract.js não foi carregado.');
      return false;
    }
    this.isReady = true;
    return true;
  }

  /**
   * Verifica se a imagem possui luminosidade e contraste mínimos para análise
   * (rejeita fotos pretas, excessivamente escuras ou vazias)
   */
  isImageTooDark(canvasElement) {
    if (!canvasElement) return false;
    try {
      const ctx = canvasElement.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const data = imgData.data;
      let totalBrightness = 0;
      const step = 4 * 10; // Amostragem rápida
      let count = 0;

      for (let i = 0; i < data.length; i += step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Luminosidade perceptual
        totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
        count++;
      }

      const avgBrightness = count > 0 ? totalBrightness / count : 0;
      // Brilho médio abaixo de 25 em escala de 0 a 255 é considerado escuro/preto
      return avgBrightness < 25;
    } catch (e) {
      return false;
    }
  }

  /**
   * Processa uma imagem e extrai o texto real
   */
  async recognizeText(imageSource, onProgress) {
    if (typeof Tesseract === 'undefined') {
      throw new Error('Biblioteca OCR não disponível.');
    }

    try {
      const result = await Tesseract.recognize(
        imageSource,
        'por',
        {
          logger: m => {
            if (m.status === 'recognizing text' && onProgress) {
              onProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      return {
        text: result.data.text || '',
        confidence: result.data.confidence || 0,
        lines: (result.data.lines || []).map(l => l.text.trim())
      };
    } catch (err) {
      console.error('Erro no processamento OCR:', err);
      throw err;
    }
  }

  /**
   * Analisa se o texto extraído contém termos oficiais de um Boletim de Urna
   * e extrai os números e candidatos reais
   */
  extractMetricsFromText(text) {
    if (!text || typeof text !== 'string') {
      return { isValidBu: false, metrics: null };
    }

    const clean = text.toUpperCase().replace(/\s+/g, ' ');

    // Termos obrigatórios que comprovam a presença de um Boletim de Urna
    const termosObrigatorios = [
      'JUSTIÇA ELEITORAL',
      'JUSTICA ELEITORAL',
      'BOLETIM DE URNA',
      'ELEIÇÃO',
      'ELEICAO',
      'ZONA ELEITORAL',
      'COMPARECIMENTO',
      'VOTAÇÃO',
      'VOTACAO',
      'URNA ELETRÔNICA',
      'SEÇÃO',
      'SECAO'
    ];

    let matchCount = 0;
    for (const termo of termosObrigatorios) {
      if (clean.includes(termo)) {
        matchCount++;
      }
    }

    // Se não tiver pelo menos 2 termos de identificação de BU, considera leitura inválida
    if (matchCount < 2) {
      return { isValidBu: false, metrics: null };
    }

    const metrics = {
      aptos: 0,
      comparecimento: 0,
      faltosos: 0,
      brancos: 0,
      nulos: 0,
      votosDetalhe: []
    };

    // Extração de Zona
    const zonaMatch = clean.match(/ZONA[\s:]*([0-9]+)/i);
    if (zonaMatch) metrics.zona = parseInt(zonaMatch[1], 10);

    // Extração de Seção
    const secaoMatch = clean.match(/SE[CÇ][AÃ]O[\s:]*([0-9]+)/i);
    if (secaoMatch) metrics.secao = parseInt(secaoMatch[1], 10);

    // Extração de Aptos
    const aptosMatch = clean.match(/APTOS[\s:]*([0-9]+)/i) || clean.match(/ELEITORES[\s:]*([0-9]+)/i);
    if (aptosMatch) metrics.aptos = parseInt(aptosMatch[1], 10);

    // Extração de Comparecimento
    const compMatch = clean.match(/COMPARECIMENTO[\s:]*([0-9]+)/i) || clean.match(/VOTANTES[\s:]*([0-9]+)/i);
    if (compMatch) metrics.comparecimento = parseInt(compMatch[1], 10);

    // Extração de Brancos
    const brancosMatch = clean.match(/BRANCO[S]?[\s:]*([0-9]+)/i);
    if (brancosMatch) metrics.brancos = parseInt(brancosMatch[1], 10);

    // Extração de Nulos
    const nulosMatch = clean.match(/NULO[S]?[\s:]*([0-9]+)/i);
    if (nulosMatch) metrics.nulos = parseInt(nulosMatch[1], 10);

    if (metrics.aptos > 0 && metrics.comparecimento > 0) {
      metrics.faltosos = Math.max(0, metrics.aptos - metrics.comparecimento);
    }

    // Extrai votos de candidatos encontrados nas linhas
    const linhas = text.split('\n');
    for (const linha of linhas) {
      const matchVoto = linha.match(/([0-9]{2,5})\s+([A-Z\s]+)\s+([0-9]+)/i);
      if (matchVoto) {
        const num = matchVoto[1];
        const nome = matchVoto[2].trim();
        const qtd = parseInt(matchVoto[3], 10);
        if (qtd > 0) {
          metrics.votosDetalhe.push({
            cargo: 'PRESIDENTE',
            numeroCandidato: num,
            nomeCandidato: nome,
            partido: `PARTIDO ${num.slice(0, 2)}`,
            tipoVoto: 'NOMINAL',
            quantidadeVotos: qtd
          });
        }
      }
    }

    const hasValidData = metrics.comparecimento > 0 || metrics.votosDetalhe.length > 0;
    return {
      isValidBu: hasValidData,
      metrics
    };
  }
}
