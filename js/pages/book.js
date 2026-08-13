// PsyAssist - Book Page (Add/Edit Patient)

const BookPage = (() => {
  let editPatientId = null;

  function formatPhoneInput(value) {
    let clean = (value || '').replace(/\D/g, '');
    if (clean.startsWith('55') && clean.length > 11) {
      clean = clean.substring(2);
    }
    if (clean.length > 11) clean = clean.substring(0, 11);
    
    if (clean.length > 6) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    } else if (clean.length > 2) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    } else if (clean.length > 0) {
      return `(${clean}`;
    }
    return '';
  }

  function render() {
    let patient = {
      name: '',
      phone: '',
      cpf: '',
      modality: 'presencial',
      valuePerSession: '',
      dayOfWeek: '1',
      time: '',
      active: true,
      notes: ''
    };
    let isEdit = false;

    if (editPatientId) {
      patient = DB.getPatient(editPatientId) || patient;
      isEdit = true;
    }

    const displayPhone = formatPhoneInput(patient.phone || '');

    return `
      <div class="page-container" style="padding-bottom:120px;">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h1 class="page-header__title">${isEdit ? 'Editar <span>Paciente</span>' : 'Novo <span>Paciente</span>'}</h1>
            <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">${isEdit ? 'Atualize os dados cadastrais' : 'Preencha os dados ou use o assistente de voz'}</p>
          </div>
          ${isEdit ? `
            <button class="btn btn-secondary btn-sm" onclick="window.BookPage.cancelEdit()" style="margin-top:4px;">
              Voltar
            </button>
          ` : ''}
        </div>

        ${!isEdit ? `
        <div class="card mb-4 text-center card--elevated" style="padding:var(--sp-5); border: 1.5px dashed var(--primary); background:var(--card);">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--primary-subtle); color:var(--primary); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:22px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          </div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text); margin-bottom:4px">Assistente por Voz</h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px; line-height:1.5;">Dite: <em>"Marcar consulta para Maria Silva quarta-feira às 15 horas valor 200 reais"</em></p>
          <button id="btn-voice" type="button" class="btn btn-primary" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:14px; font-weight:600;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            <span id="btn-voice-label">Ditar Paciente Completo</span>
          </button>
        </div>

        <div style="text-align:center; margin-bottom:var(--sp-4); font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-weight:700">Ou preencha manualmente</div>
        ` : ''}

        <form id="form-patient" class="card" style="box-shadow:var(--shadow-sm);">
          <div class="form-group">
            <label class="form-label">Nome Completo *</label>
            <div style="display:flex; gap:8px">
              <input type="text" id="p-name" class="form-input" value="${patient.name || ''}" required placeholder="Ex: Ana Paula Souza" style="flex:1">
              <button type="button" class="mic-field-btn" data-target="p-name" title="Ditar nome" style="width:48px; height:48px; flex-shrink:0; border-radius:var(--r-md); border:1px solid var(--border); background:var(--surface); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">WhatsApp (DDD + Número) *</label>
            <div style="display:flex; align-items:center; gap:8px">
              <div style="background:var(--surface); padding:0 12px; height:48px; border-radius:var(--r-md); border:1px solid var(--border); display:flex; align-items:center; font-weight:600; color:var(--text-secondary); flex-shrink:0">+55</div>
              <input type="tel" id="p-phone" class="form-input" value="${displayPhone}" placeholder="(11) 98765-4321" style="flex:1" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Valor da Sessão (R$) *</label>
              <div style="display:flex; gap:8px">
                <input type="number" step="any" id="p-value" class="form-input" value="${patient.valuePerSession || ''}" required placeholder="Ex: 180" style="flex:1">
                <button type="button" class="mic-field-btn" data-target="p-value" title="Ditar valor" style="width:48px; height:48px; flex-shrink:0; border-radius:var(--r-md); border:1px solid var(--border); background:var(--surface); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                </button>
              </div>
            </div>

            <div class="form-group" style="flex:1;">
              <label class="form-label">Modalidade</label>
              <select id="p-modality" class="form-input form-input--select">
                <option value="presencial" ${patient.modality === 'presencial' ? 'selected' : ''}>🏢 Presencial</option>
                <option value="online" ${patient.modality === 'online' ? 'selected' : ''}>💻 Online</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Dia da Semana *</label>
              <select id="p-day" class="form-input form-input--select">
                <option value="1" ${patient.dayOfWeek == 1 ? 'selected' : ''}>Segunda-feira</option>
                <option value="2" ${patient.dayOfWeek == 2 ? 'selected' : ''}>Terça-feira</option>
                <option value="3" ${patient.dayOfWeek == 3 ? 'selected' : ''}>Quarta-feira</option>
                <option value="4" ${patient.dayOfWeek == 4 ? 'selected' : ''}>Quinta-feira</option>
                <option value="5" ${patient.dayOfWeek == 5 ? 'selected' : ''}>Sexta-feira</option>
                <option value="6" ${patient.dayOfWeek == 6 ? 'selected' : ''}>Sábado</option>
                <option value="0" ${patient.dayOfWeek == 0 ? 'selected' : ''}>Domingo</option>
              </select>
            </div>

            <div class="form-group" style="flex:1;">
              <label class="form-label">Horário *</label>
              <input type="time" id="p-time" class="form-input" value="${patient.time || ''}" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">CPF / Documento (Opcional — para Recibos)</label>
            <input type="text" id="p-cpf" class="form-input" value="${patient.cpf || ''}" placeholder="Ex: 000.000.000-00">
          </div>

          <div class="form-group">
            <label class="form-label">Anotações Iniciais / Queixa Principal</label>
            <div style="position:relative">
              <textarea id="p-notes" class="form-input" rows="3" placeholder="Ex: Queixa principal, objetivo terapêutico, histórico...">${patient.notes || ''}</textarea>
              <button type="button" class="mic-field-btn" data-target="p-notes" title="Ditar anotação" style="position:absolute; bottom:8px; right:8px; width:36px; height:36px; border-radius:var(--r-md); border:1px solid var(--border); background:var(--surface); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              </button>
            </div>
          </div>

          ${isEdit ? `
          <div class="form-group" style="background:var(--surface); padding:12px 16px; border-radius:var(--r-md); border:1px solid var(--border);">
            <label class="toggle-wrap" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
              <div>
                <span class="toggle-label" style="font-weight:600; color:var(--text);">Paciente Ativo na Agenda</span>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Desmarque se o paciente concluiu o processo ou pausou o tratamento</div>
              </div>
              <div class="toggle">
                <input type="checkbox" id="p-active" ${patient.active ? 'checked' : ''}>
                <div class="toggle-slider"></div>
              </div>
            </label>
          </div>
          ` : ''}

          <div class="mt-4">
            <button type="submit" class="btn btn-primary btn-full" style="padding:16px; font-weight:700; font-size:15px;">
              ${isEdit ? '💾 Salvar Alterações' : '✨ Cadastrar Paciente'}
            </button>
          </div>

          ${isEdit ? `
          <div class="mt-3">
            <button type="button" id="btn-delete" class="btn btn-danger btn-full" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:#EF4444; font-size:13px; padding:12px;">
              🗑️ Excluir Paciente
            </button>
          </div>
          ` : ''}
        </form>
      </div>
    `;
  }

  function onEnter() {
    const phoneInput = document.getElementById('p-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = formatPhoneInput(e.target.value);
      });
    }

    const form = document.getElementById('form-patient');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const rawPhone = document.getElementById('p-phone').value.replace(/\D/g, '');
        const data = {
          name: document.getElementById('p-name').value.trim(),
          phone: rawPhone,
          cpf: document.getElementById('p-cpf')?.value.trim() || '',
          modality: document.getElementById('p-modality')?.value || 'presencial',
          valuePerSession: parseFloat(document.getElementById('p-value').value || 0),
          dayOfWeek: parseInt(document.getElementById('p-day').value),
          time: document.getElementById('p-time').value,
          notes: document.getElementById('p-notes').value.trim(),
        };

        if (editPatientId) {
          data.id = editPatientId;
          data.active = document.getElementById('p-active').checked;
        }

        const saved = DB.savePatient(data);
        App.toast(editPatientId ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso! 🎉', 'success');
        
        // If it was a new patient and had initial notes, create initial evolution note
        if (!editPatientId && data.notes && saved?.id) {
          DB.saveEvolution({
            patientId: saved.id,
            title: 'Queixa Inicial / Anamnese',
            text: data.notes,
          });
        }

        setEditId(null);
        Router.navigate('patients');
      });
    }

    function startVoiceForField(targetId, btn) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        App.toast('Navegador sem suporte a reconhecimento de voz.', 'error');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span style="font-size:10px; font-weight:700; color:var(--primary);">...</span>';
      btn.style.borderColor = 'var(--primary)';
      btn.disabled = true;
      recognition.start();

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        const el = document.getElementById(targetId);
        if (!el) return;

        if (el.tagName === 'TEXTAREA') {
          el.value = el.value ? `${el.value} ${text}` : text;
        } else if (el.type === 'number') {
          const num = text.replace(/[^\d.,]/g, '').replace(',', '.');
          if (num) el.value = num;
        } else {
          el.value = text.replace(/\b\w/g, c => c.toUpperCase());
        }
        App.toast('Campo preenchido por voz! ✨', 'success');
      };

      recognition.onend = () => {
        btn.innerHTML = originalHTML;
        btn.style.borderColor = '';
        btn.disabled = false;
      };

      recognition.onerror = (e) => {
        App.toast(`Microfone: ${e.error || 'Não reconhecido'}`, 'error');
        btn.innerHTML = originalHTML;
        btn.style.borderColor = '';
        btn.disabled = false;
      };
    }

    document.querySelectorAll('.mic-field-btn').forEach(btn => {
      btn.addEventListener('click', () => startVoiceForField(btn.getAttribute('data-target'), btn));
    });

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
        const labelEl = document.getElementById('btn-voice-label');
        if (labelEl) labelEl.textContent = 'Ouvindo... Fale agora';
        btnVoice.style.background = 'var(--primary-dark)';
        recognition.start();

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const parsed = VoiceParser.parse(transcript);

          if (parsed.name) document.getElementById('p-name').value = parsed.name;
          if (parsed.valuePerSession !== null) document.getElementById('p-value').value = parsed.valuePerSession;
          if (parsed.time) document.getElementById('p-time').value = parsed.time;
          if (parsed.dayOfWeek !== null) document.getElementById('p-day').value = parsed.dayOfWeek;
          App.toast('Campos preenchidos por voz! Revise e clique em Cadastrar.', 'success');
        };

        recognition.onend = () => {
          if (labelEl) labelEl.textContent = 'Ditar Paciente Completo';
          btnVoice.style.background = '';
        };

        recognition.onerror = (e) => {
          App.toast(`Erro no microfone: ${e.error}`, 'error');
          if (labelEl) labelEl.textContent = 'Ditar Paciente Completo';
          btnVoice.style.background = '';
        };
      });
    }

    const btnDel = document.getElementById('btn-delete');
    if (btnDel) {
      btnDel.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este paciente, seu prontuário e histórico financeiro?')) {
          DB.deletePatient(editPatientId);
          App.toast('Paciente excluído.', 'success');
          setEditId(null);
          Router.navigate('patients');
        }
      });
    }
  }

  function setEditId(id) {
    editPatientId = id;
  }

  function cancelEdit() {
    setEditId(null);
    Router.navigate('patients');
  }

  return { render, onEnter, setEditId, cancelEdit };
})();

window.BookPage = BookPage;
