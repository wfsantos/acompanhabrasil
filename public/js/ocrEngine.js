/**
 * Motor de OCR (Tesseract.js) — AcompanhaBrasil
 * 
 * Executa o reconhecimento óptico de caracteres em worker no cliente
 * para extrair números e palavras-chave impressas no Boletim de Urna.
 */

class OcrEngine {
  constructor() {
    this.isReady = false;
    this.worker = null;
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
   * Processa uma imagem (base64 ou Blob) e extrai o texto
   * @param {string|Blob} imageSource 
   * @param {Function} onProgress - Callback de progresso (0 a 100)
   */
  async recognizeText(imageSource, onProgress) {
    if (typeof Tesseract === 'undefined') {
      throw new Error('Biblioteca OCR não disponível.');
    }

    try {
      const result = await Tesseract.recognize(
        imageSource,
        'por', // Português
        {
          logger: m => {
            if (m.status === 'recognizing text' && onProgress) {
              onProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        lines: result.data.lines.map(l => l.text.trim())
      };
    } catch (err) {
      console.error('Erro no processamento OCR:', err);
      throw err;
    }
  }

  /**
   * Extrai métricas chave do texto OCR (ex: comparecimento, zona, seção)
   */
  extractMetricsFromText(text) {
    const clean = text.replace(/\s+/g, ' ');
    const metrics = {};

    // Procura por Zona
    const zonaMatch = clean.match(/ZONA[\s:]*([0-9]+)/i);
    if (zonaMatch) metrics.zona = parseInt(zonaMatch[1], 10);

    // Procura por Seção
    const secaoMatch = clean.match(/SE[CÇ][AÃ]O[\s:]*([0-9]+)/i);
    if (secaoMatch) metrics.secao = parseInt(secaoMatch[1], 10);

    // Procura por Eleitores Aptos
    const aptosMatch = clean.match(/APTOS[\s:]*([0-9]+)/i) || clean.match(/ELEITORES[\s:]*([0-9]+)/i);
    if (aptosMatch) metrics.aptos = parseInt(aptosMatch[1], 10);

    // Procura por Comparecimento
    const compMatch = clean.match(/COMPARECIMENTO[\s:]*([0-9]+)/i) || clean.match(/VOTANTES[\s:]*([0-9]+)/i);
    if (compMatch) metrics.comparecimento = parseInt(compMatch[1], 10);

    return metrics;
  }
}
