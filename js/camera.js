// PsyAssist — Camera & OCR Module

const OCR = (() => {
  let stream = null;

  async function openCamera(onCapture) {
    if (document.getElementById('ocr-screen')) return;

    const html = `
      <div id="ocr-screen" class="ocr-screen">
        <div class="ocr-video-wrap">
          <video id="ocr-video" class="ocr-video" autoplay playsinline></video>
          <div class="ocr-overlay">
            <div class="ocr-frame"></div>
            <div class="ocr-hint">Alinhe as anotações do paciente dentro do quadro</div>
          </div>
        </div>
        <div class="ocr-controls">
          <button class="icon-btn" id="ocr-close" style="width:50px; height:50px; background: rgba(255,255,255,0.2); border:none;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div class="ocr-capture-btn" id="ocr-capture">
            <div class="ocr-capture-btn-inner"></div>
          </div>
          
          <div style="width:50px"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const video = document.getElementById('ocr-video');
    
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = stream;
    } catch (err) {
      console.error('Camera err', err);
      closeCamera();
      App.toast('Erro ao acessar a câmera. Verifique as permissões.', 'error');
      return;
    }

    document.getElementById('ocr-close').addEventListener('click', closeCamera);
    document.getElementById('ocr-capture').addEventListener('click', () => {
      captureFrame(video, onCapture);
    });
  }

  function closeCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    const el = document.getElementById('ocr-screen');
    if (el) el.remove();
  }

  async function captureFrame(video, onCapture) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    closeCamera();
    
    // Show processing animation
    showProcessing();

    try {
      // Use Tesseract
      const worker = await window.Tesseract.createWorker('por');
      const ret = await worker.recognize(canvas);
      const text = ret.data.text;
      await worker.terminate();
      
      hideProcessing();
      onCapture(text);
    } catch (err) {
      console.error(err);
      hideProcessing();
      App.toast('Erro ao ler a imagem. Tente novamente.', 'error');
    }
  }

  function showProcessing() {
    const html = `
      <div id="ocr-processing" class="ocr-processing">
        <div class="ocr-brain">
          <div class="ocr-brain-icon">🧠</div>
        </div>
        <div>
          <div class="ocr-processing__title">Lendo caderninho...</div>
          <div class="ocr-processing__subtitle">Isso pode levar alguns segundos</div>
        </div>
        <div class="ocr-dots">
          <div class="ocr-dot"></div><div class="ocr-dot"></div><div class="ocr-dot"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function hideProcessing() {
    const el = document.getElementById('ocr-processing');
    if (el) el.remove();
  }

  // Very naive parser for demo purposes
  function parseTextToPatient(text) {
    const lines = text.split('\\n').map(l => l.trim()).filter(Boolean);
    let patient = {
      name: '',
      phone: '',
      valuePerSession: '',
      dayOfWeek: '1', // default Monday
      time: '',
      notes: ''
    };
    
    if (lines.length > 0) patient.name = lines[0].replace(/[^a-zA-ZáéíóúÁÉÍÓÚçÇ ]/g, '');
    
    const moneyRegex = /R?\$?\s?(\d{2,3})[,.]?\d*/i;
    const timeRegex = /([01]?\d|2[0-3])[:hH](\d{2})?/;
    const phoneRegex = /(?:\(?\d{2}\)?\s?)?9\d{4}-?\d{4}/;

    text = text.replace(/\n/g, ' ');
    
    const moneyMatch = text.match(moneyRegex);
    if (moneyMatch) patient.valuePerSession = moneyMatch[1];
    
    const timeMatch = text.match(timeRegex);
    if (timeMatch) patient.time = timeMatch[1].padStart(2, '0') + ':' + (timeMatch[2] || '00');
    
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) patient.phone = phoneMatch[0].replace(/\\D/g, '');

    patient.notes = text; // save raw text for review

    return patient;
  }

  return { openCamera, parseTextToPatient };
})();

window.OCR = OCR;
