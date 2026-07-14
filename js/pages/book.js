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

    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-header__title">${isEdit ? 'Editar <span>Paciente</span>' : 'Novo <span>Paciente</span>'}</h1>
        </div>
        
        ${!isEdit ? `
        <div class="card mb-4 text-center card--elevated" style="padding:var(--sp-5); border: 1px dashed var(--primary)">
          <div class="quick-action__icon" style="margin: 0 auto var(--sp-3); width:64px; height:64px; background:var(--primary-subtle); color:var(--primary-light)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <h3 style="font-size:16px; margin-bottom:4px">Cadastrar via Foto</h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px">Tire foto do caderninho e a IA preenche o formulário para você.</p>
          <button id="btn-camera" class="btn btn-primary">Abrir Câmera</button>
        </div>
        
        <div style="text-align:center; margin-bottom:var(--sp-4); font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-weight:600">Ou preencha manualmente</div>
        ` : ''}

        <form id="form-patient" class="card">
          
          <div class="form-group">
            <label class="form-label">Nome Completo</label>
            <input type="text" id="p-name" class="form-input" value="${patient.name}" required placeholder="Ex: João Silva">
          </div>
          
          <div class="form-group">
            <label class="form-label">WhatsApp (com DDD)</label>
            <input type="tel" id="p-phone" class="form-input" value="${patient.phone}" placeholder="Ex: 11999999999">
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

    const btnCam = document.getElementById('btn-camera');
    if (btnCam) {
      btnCam.addEventListener('click', () => {
        window.OCR.openCamera((text) => {
          const parsed = window.OCR.parseTextToPatient(text);
          fillFormFromOCR(parsed);
        });
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
