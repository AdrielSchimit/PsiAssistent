// PsyAssist — Book Page (Add/Edit Patient)

const BookPage = (() => {
  let editPatientId = null;

  function render() {
    let patient = { name: '', phone: '', valuePerSession: '', dayOfWeek: '1', time: '', active: true, notes: '' };
    let isEdit = false;

    if (editPatientId) {
      patient = DB.getPatient(editPatientId) || patient;
      isEdit = true;
    }

    let displayPhone = patient.phone || '';
    if (displayPhone.startsWith('55') && displayPhone.length > 11) {
      displayPhone = displayPhone.substring(2);
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-header__title">${isEdit ? 'Editar <span>Paciente</span>' : 'Novo <span>Paciente</span>'}</h1>
        </div>
        
        ${!isEdit ? `
        <div class="card mb-4 text-center card--elevated" style="padding:var(--sp-5); border: 1px dashed var(--primary)">
          <h3 style="font-size:16px; margin-bottom:4px">Assistente Inteligente</h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px">Dite os dados do paciente ou tire uma foto do seu caderninho.</p>
          <div style="display:flex; gap:12px; justify-content:center">
            <button id="btn-voice" type="button" class="btn btn-primary" style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px">
              🎤 Ditar
            </button>
            <button id="btn-camera" type="button" class="btn" style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; border:1px solid var(--primary); color:var(--primary); background:transparent">
              📷 Foto
            </button>
          </div>
        </div>
        
        <div style="text-align:center; margin-bottom:var(--sp-4); font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-weight:600">Ou preencha manualmente</div>
        ` : ''}

        <form id="form-patient" class="card">
          
          <div class="form-group">
            <label class="form-label">Nome Completo</label>
            <input type="text" id="p-name" class="form-input" value="${patient.name}" required placeholder="Ex: João Silva">
          </div>
          
          <div class="form-group">
            <label class="form-label">WhatsApp (DDD + Número)</label>
            <div style="display:flex; align-items:center; gap:8px">
              <div style="background:var(--surface); padding:0 12px; height:48px; border-radius:var(--r-md); border:1px solid var(--border); display:flex; align-items:center; font-weight:500; color:var(--text-secondary); flex-shrink:0">+55</div>
              <input type="tel" id="p-phone" class="form-input" value="${displayPhone}" placeholder="Ex: 11999999999" style="flex:1">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Valor (R$)</label>
              <input type="number" id="p-value" class="form-input" value="${patient.valuePerSession}" required placeholder="Ex: 150">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Dia da Semana</label>
              <select id="p-day" class="form-input form-input--select">
                <option value="1" ${patient.dayOfWeek == 1 ? 'selected' : ''}>Segunda</option>
                <option value="2" ${patient.dayOfWeek == 2 ? 'selected' : ''}>Terça</option>
                <option value="3" ${patient.dayOfWeek == 3 ? 'selected' : ''}>Quarta</option>
                <option value="4" ${patient.dayOfWeek == 4 ? 'selected' : ''}>Quinta</option>
                <option value="5" ${patient.dayOfWeek == 5 ? 'selected' : ''}>Sexta</option>
                <option value="6" ${patient.dayOfWeek == 6 ? 'selected' : ''}>Sábado</option>
                <option value="0" ${patient.dayOfWeek == 0 ? 'selected' : ''}>Domingo</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Horário</label>
              <input type="time" id="p-time" class="form-input" value="${patient.time}" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Anotações do OCR / Extras</label>
            <textarea id="p-notes" class="form-input" rows="3" placeholder="Opcional">${patient.notes}</textarea>
          </div>
          
          ${isEdit ? `
          <div class="form-group">
            <label class="toggle-wrap">
              <span class="toggle-label">Paciente Ativo</span>
              <div class="toggle">
                <input type="checkbox" id="p-active" ${patient.active ? 'checked' : ''}>
                <div class="toggle-slider"></div>
              </div>
            </label>
          </div>
          ` : ''}

          <div class="mt-4">
            <button type="submit" class="btn btn-primary btn-full">${isEdit ? 'Salvar Alterações' : 'Cadastrar Paciente'}</button>
          </div>
          
          ${isEdit ? `
          <div class="mt-3">
            <button type="button" id="btn-delete" class="btn btn-danger btn-full" style="background:transparent; border-color:transparent;">Excluir Paciente</button>
          </div>
          ` : ''}
        </form>
      </div>
    `;
  }

  function fillFormFromOCR(data) {
    if (data.name) document.getElementById('p-name').value = data.name;
    if (data.phone) document.getElementById('p-phone').value = data.phone;
    if (data.valuePerSession) document.getElementById('p-value').value = data.valuePerSession;
    if (data.time) document.getElementById('p-time').value = data.time;
    if (data.notes) document.getElementById('p-notes').value = data.notes;
    
    App.toast('Dados pré-preenchidos. Por favor, revise!', 'success');
  }

  function onEnter() {
    const form = document.getElementById('form-patient');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const data = {
        name: document.getElementById('p-name').value,
        phone: document.getElementById('p-phone').value,
        valuePerSession: parseFloat(document.getElementById('p-value').value || 0),
        dayOfWeek: parseInt(document.getElementById('p-day').value),
        time: document.getElementById('p-time').value,
        notes: document.getElementById('p-notes').value,
      };

      if (editPatientId) {
        data.id = editPatientId;
        data.active = document.getElementById('p-active').checked;
      }
      
      DB.savePatient(data);
      
      App.toast(editPatientId ? 'Paciente atualizado!' : 'Paciente cadastrado!', 'success');
      
      // Reset state and nav to patients
      setEditId(null);
      Router.navigate('patients');
    });

    const btnCamera = document.getElementById('btn-camera');
    if (btnCamera) {
      btnCamera.addEventListener('click', () => {
        window.OCR.openCamera((text) => {
          const parsed = window.OCR.parseTextToPatient(text);
          fillFormFromOCR(parsed);
        });
      });
    }

    const btnVoice = document.getElementById('btn-voice');
    if (btnVoice) {
      btnVoice.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          App.toast('Seu navegador não suporta reconhecimento de voz.', 'error');
          return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        
        btnVoice.innerHTML = '🎙️ Escutando...';
        btnVoice.style.background = 'var(--accent)';
        btnVoice.style.color = 'white';
        btnVoice.style.borderColor = 'transparent';
        
        recognition.start();
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const parsed = VoiceParser.parse(transcript);

          if (parsed.name) document.getElementById('p-name').value = parsed.name;
          if (parsed.valuePerSession !== null) document.getElementById('p-value').value = parsed.valuePerSession;
          if (parsed.time) document.getElementById('p-time').value = parsed.time;
          if (parsed.dayOfWeek !== null) document.getElementById('p-day').value = parsed.dayOfWeek;
          document.getElementById('p-notes').value = `Ditado: ${transcript}`;
          App.toast('Preenchido por Voz!', 'success');
        };
        
        recognition.onend = () => {
          btnVoice.innerHTML = '🎤 Ditar';
          btnVoice.style.background = '';
        };
        
        recognition.onerror = (e) => {
          App.toast('Erro no microfone: ' + e.error, 'error');
        };
      });
    }

    const btnDel = document.getElementById('btn-delete');
    if (btnDel) {
      btnDel.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este paciente e todo o seu histórico financeiro?')) {
          DB.deletePatient(editPatientId);
          App.toast('Paciente excluído', 'success');
          setEditId(null);
          Router.navigate('patients');
        }
      });
    }
  }

  function setEditId(id) {
    editPatientId = id;
  }

  return { render, onEnter, setEditId };
})();

window.BookPage = BookPage;
