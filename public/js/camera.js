/**
 * Gerenciador de Câmera — AcompanhaBrasil
 * 
 * Utiliza a MediaDevices API para stream de vídeo direto do navegador
 * com preferência por câmera traseira em dispositivos móveis.
 */

class CameraManager {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.stream = null;
    this.isRunning = false;
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Seu navegador não suporta acesso direto à câmera. Utilize o botão de upload de foto.');
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.isRunning = true;
      return true;
    } catch (err) {
      console.warn('Falha com constraints ideais, tentando modo padrão...', err);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.video.srcObject = this.stream;
        await this.video.play();
        this.isRunning = true;
        return true;
      } catch (fallbackErr) {
        throw new Error('Permissão de acesso à câmera negada ou dispositivo não disponível.');
      }
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isRunning = false;
  }

  takeSnapshot() {
    if (!this.video || !this.canvas) return null;
    const context = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth || 640;
    this.canvas.height = this.video.videoHeight || 480;
    context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    return this.canvas.toDataURL('image/jpeg', 0.85);
  }
}
