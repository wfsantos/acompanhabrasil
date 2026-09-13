/**
 * Scanner de QR Code do Boletim de Urna (jsQR) — AcompanhaBrasil
 */

class QrScanner {
  constructor(videoElement, canvasElement, onScanSuccess) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.context = canvasElement ? canvasElement.getContext('2d', { willReadFrequently: true }) : null;
    this.onScanSuccess = onScanSuccess;
    this.isScanning = false;
    this.animationFrameId = null;
  }

  startScanning() {
    if (this.isScanning) return;
    this.isScanning = true;
    this._scanLoop();
  }

  stopScanning() {
    this.isScanning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  _scanLoop() {
    if (!this.isScanning) return;

    if (this.video && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Utiliza jsQR se disponível globalmente
      if (typeof jsQR !== 'undefined') {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          this.stopScanning();
          this.onScanSuccess(code.data);
          return;
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this._scanLoop());
  }

  /**
   * Lê QR Code a partir de um elemento Image carregado
   */
  scanImageElement(imgElement) {
    if (!this.context || typeof jsQR === 'undefined') return null;

    this.canvas.width = imgElement.naturalWidth || imgElement.width;
    this.canvas.height = imgElement.naturalHeight || imgElement.height;
    this.context.drawImage(imgElement, 0, 0, this.canvas.width, this.canvas.height);

    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    return code ? code.data : null;
  }
}
