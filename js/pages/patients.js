// PsyAssist — Patients Page with Complete Clinical Records (Prontuário & Recibos)

const PatientsPage = (() => {
  let activeTab = 'overview'; // 'overview' | 'evolutions' | 'documents'

  function setModalTab(tab) {
    activeTab = tab;
    const modalContent = document.getElementById('patient-modal-body');
    const pId = modalContent?.getAttribute('data-patient-id');
    if (pId) {
      const p = DB.getPatient(pId);
      if (p) {
        modalContent.innerHTML = renderModalBody(p);
        bindModalEvents(p);
      }
    }
  }

  function renderModalBody(p) {
    const month = DB.getCurrentMonth();
    DB.ensureMonthPayments(month);
    const payments = DB.getPaymentsByMonth(month);
    const pay = payments.find(pay => pay.patientId === p.id);
    const isPaid = pay?.paid;
    const isOverdue = p.active && !isPaid;
    const evolutions = DB.getEvolutions(p.id);

    return `
      <!-- Tab Navigation -->
      <div style="display:flex; border-bottom:1px solid var(--border); margin-bottom:16px; gap:8px;">
        <button onclick="window.PatientsPage.setModalTab('overview')" style="
          padding:10px 14px; font-size:13px; font-weight:700; border:none; background:none; cursor:pointer;
          color:${activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)'};
          border-bottom:2px solid ${activeTab === 'overview' ? 'var(--primary)' : 'transparent'};
        ">Visão Geral & Zap</button>
        
        <button onclick="window.PatientsPage.setModalTab('evolutions')" style="
          padding:10px 14px; font-size:13px; font-weight:700; border:none; background:none; cursor:pointer;
          color:${activeTab === 'evolutions' ? 'var(--primary)' : 'var(--text-muted)'};
          border-bottom:2px solid ${activeTab === 'evolutions' ? 'var(--primary)' : 'transparent'};
          display:flex; align-items:center; gap:6px;
        ">
          Prontuário / Sessões
          <span style="background:var(--primary-subtle); color:var(--primary); font-size:10px; padding:2px 6px; border-radius:10px;">${evolutions.length}</span>
        </button>

        <button onclick="window.PatientsPage.setModalTab('documents')" style="
          padding:10px 14px; font-size:13px; font-weight:700; border:none; background:none; cursor:pointer;
          color:${activeTab === 'documents' ? 'var(--primary)' : 'var(--text-muted)'};
          border-bottom:2px solid ${activeTab === 'documents' ? 'var(--primary)' : 'transparent'};
        ">Recibos & Docs</button>
      </div>

      <!-- TAB 1: VISÃO GERAL -->
      ${activeTab === 'overview' ? `
        <!-- Stats row -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:var(--sp-4)">
          <div style="background:var(--surface); border-radius:var(--r-md); padding:12px; text-align:center">
            <div style="font-size:16px; font-weight:700; color:var(--primary)">${DB.formatCurrency(p.valuePerSession || 0)}</div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px">Por sessão</div>
          </div>
          <div style="background:var(--surface); border-radius:var(--r-md); padding:12px; text-align:center">
            <div style="font-size:16px; font-weight:700; color:var(--text)">${p.modality === 'online' ? '💻 Online' : '🏢 Presencial'}</div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px">Modalidade</div>
          </div>
          <div style="background:var(--surface); border-radius:var(--r-md); padding:12px; text-align:center">
            <div style="font-size:16px; font-weight:700; color:${isOverdue ? '#F43F5E' : '#10B981'}">${isOverdue ? '⏳ Aberto' : '✅ Pago'}</div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px">Mês atual</div>
          </div>
        </div>

        ${p.cpf ? `
          <div style="background:var(--surface); border-radius:var(--r-md); padding:8px 12px; margin-bottom:12px; font-size:12px; color:var(--text-secondary); display:flex; justify-content:space-between;">
            <span>CPF / Documento:</span>
            <strong>${p.cpf}</strong>
          </div>
        ` : ''}

        ${p.notes ? `
        <!-- Notes -->
        <div style="background:var(--surface); border-radius:var(--r-md); padding:var(--sp-3); margin-bottom:var(--sp-4)">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--text-muted); margin-bottom:6px">Observações Iniciais</div>
          <div style="font-size:13px; color:var(--text); line-height:1.5">${p.notes}</div>
        </div>` : ''}

        <!-- WhatsApp templates -->
        <div style="margin-bottom:var(--sp-4)">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--text-muted); margin-bottom:8px">Mensagens Rápidas no WhatsApp</div>
          <div style="display:flex; flex-direction:column; gap:8px">
            ${Object.entries(WhatsApp.getTemplateLabels()).map(([key, label]) => `
              <button onclick="window.WhatsApp.sendByKey(${JSON.stringify(p).replace(/"/g, '&quot;')}, ${p.valuePerSession || 0}, '${key}');" style="
                background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md);
                padding:12px 14px; text-align:left; font-size:13px; font-weight:600; color:var(--text); cursor:pointer;
                display:flex; align-items:center; justify-content:space-between; transition: all 0.2s;
              ">
                <span style="display:flex; align-items:center; gap:8px;">${label}</span>
                <span style="color:#25D366; font-size:16px;">📲</span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- TAB 2: PRONTUÁRIO / EVOLUÇÕES CLÍNICAS -->
      ${activeTab === 'evolutions' ? `
        <div style="margin-bottom:16px;">
          <div style="background:var(--surface); border-radius:var(--r-md); padding:14px; border:1px solid var(--border); margin-bottom:16px;">
            <div style="font-size:13px; font-weight:700; color:var(--text); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <span>📝 Nova Evolução da Sessão</span>
              <button id="btn-voice-evo" type="button" class="btn btn-secondary btn-sm" style="font-size:11px; padding:4px 8px; display:flex; align-items:center; gap:4px;">
                🎤 Ditar Anotação
              </button>
            </div>
            
            <div style="display:flex; gap:8px; margin-bottom:8px;">
              <input type="text" id="evo-title" class="form-input" placeholder="Título (Ex: Sessão 04 - Manejo de ansiedade)" style="flex:2; font-size:12px; height:38px;">
              <input type="date" id="evo-date" class="form-input" value="${new Date().toISOString().slice(0,10)}" style="flex:1; font-size:12px; height:38px;">
            </div>

            <textarea id="evo-text" class="form-input" rows="3" placeholder="Descreva os temas abordados, intervenções, estado do paciente e encaminhamentos..." style="font-size:13px; line-height:1.5; margin-bottom:8px;"></textarea>

            <button id="btn-save-evo" class="btn btn-primary btn-sm" style="width:100%; padding:10px; font-weight:700;">
              Salvar no Prontuário 🔒
            </button>
          </div>

          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--text-muted); margin-bottom:12px;">Histórico de Atendimentos</div>

          ${evolutions.length === 0 ? `
            <div style="text-align:center; padding:24px; color:var(--text-muted); background:var(--surface); border-radius:var(--r-md);">
              <div style="font-size:24px; margin-bottom:6px">📋</div>
              <div style="font-size:13px; font-weight:600">Nenhum registro clínico salvo ainda</div>
              <div style="font-size:11px; margin-top:2px">Use o campo acima para registrar a primeira evolução deste paciente.</div>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:10px; max-height:280px; overflow-y:auto; padding-right:4px;">
              ${evolutions.map(evo => `
                <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:12px; position:relative;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
                    <strong style="font-size:13px; color:var(--text);">${evo.title || 'Sessão Psicoterapêutica'}</strong>
                    <span style="font-size:11px; color:var(--primary); font-weight:600; background:var(--primary-subtle); padding:2px 6px; border-radius:6px;">
                      ${DB.formatDate(evo.date)} ${evo.time ? `às ${evo.time}` : ''}
                    </span>
                  </div>
                  <p style="font-size:12px; color:var(--text); line-height:1.5; white-space:pre-wrap; margin-top:4px;">${evo.text}</p>
                  <div style="display:flex; justify-content:flex-end; margin-top:8px;">
                    <button onclick="window.PatientsPage.deleteEvolution('${evo.id}')" style="color:#EF4444; font-size:11px; font-weight:600; cursor:pointer; background:none; border:none;">
                      Excluir anotação
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      ` : ''}

      <!-- TAB 3: RECIBOS & DOCUMENTOS -->
      ${activeTab === 'documents' ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:13px; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
            Gere documentos oficiais e prontos para impressão ou envio ao paciente (para reembolso do plano de saúde ou justificativa de comparecimento).
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:14px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:14px; color:var(--text); display:block;">📄 Recibo de Honorários</strong>
                <span style="font-size:11px; color:var(--text-muted);">Comprovante de pagamento com CRP para reembolso</span>
              </div>
              <button onclick="window.PatientsPage.generateReceipt('${p.id}')" class="btn btn-primary btn-sm" style="padding:8px 14px; font-weight:700;">
                Gerar Recibo
              </button>
            </div>

            <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:14px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:14px; color:var(--text); display:block;">📑 Declaração de Comparecimento</strong>
                <span style="font-size:11px; color:var(--text-muted);">Atestado de presença em sessão para trabalho/faculdade</span>
              </div>
              <button onclick="window.PatientsPage.generateDeclaration('${p.id}')" class="btn btn-secondary btn-sm" style="padding:8px 14px; font-weight:700;">
                Gerar Declaração
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Actions Footer -->
      <div style="display:flex; gap:8px; margin-top:20px; border-top:1px solid var(--border); padding-top:16px;">
        <button onclick="window.PatientsPage.editPatient('${p.id}'); window.PatientsPage.closeModal()" class="btn btn-secondary" style="flex:1; padding:12px; font-weight:600;">
          ✏️ Editar Cadastro
        </button>
        <button onclick="window.PatientsPage.closeModal()" class="btn btn-primary" style="padding:12px 20px; font-weight:600;">
          Concluir
        </button>
      </div>
    `;
  }

  function bindModalEvents(p) {
    const btnSaveEvo = document.getElementById('btn-save-evo');
    if (btnSaveEvo) {
      btnSaveEvo.addEventListener('click', () => {
        const text = document.getElementById('evo-text')?.value.trim();
        const title = document.getElementById('evo-title')?.value.trim();
        const date = document.getElementById('evo-date')?.value;
        if (!text) {
          App.toast('Escreva uma anotação antes de salvar.', 'error');
          return;
        }

        DB.saveEvolution({
          patientId: p.id,
          title: title || 'Sessão Psicoterapêutica',
          text,
          date,
        });

        App.toast('Evolução salva no prontuário! 🔒', 'success');
        setModalTab('evolutions');
      });
    }

    const btnVoiceEvo = document.getElementById('btn-voice-evo');
    if (btnVoiceEvo) {
      btnVoiceEvo.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          App.toast('Seu navegador não suporta reconhecimento de voz.', 'error');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        btnVoiceEvo.textContent = 'Ouvindo...';
        btnVoiceEvo.disabled = true;
        recognition.start();

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const evoText = document.getElementById('evo-text');
          if (evoText) {
            evoText.value = evoText.value ? `${evoText.value} ${transcript}` : transcript;
          }
          App.toast('Ditado capturado!', 'success');
        };

        recognition.onend = () => {
          btnVoiceEvo.textContent = '🎤 Ditar Anotação';
          btnVoiceEvo.disabled = false;
        };

        recognition.onerror = (e) => {
          App.toast(`Microfone: ${e.error}`, 'error');
          btnVoiceEvo.textContent = '🎤 Ditar Anotação';
          btnVoiceEvo.disabled = false;
        };
      });
    }
  }

  function renderProfileModal(p) {
    const month = DB.getCurrentMonth();
    DB.ensureMonthPayments(month);
    const payments = DB.getPaymentsByMonth(month);
    const pay = payments.find(pay => pay.patientId === p.id);
    const isPaid = pay?.paid;
    const isOverdue = p.active && !isPaid;

    return `
      <div id="patient-modal-overlay" onclick="if(event.target===this)window.PatientsPage.closeModal()" style="
        position:fixed; inset:0; z-index:1000;
        background:rgba(0,0,0,0.45); backdrop-filter:blur(4px);
        display:flex; align-items:flex-end; justify-content:center;
        animation: fadeIn 0.2s ease;
      ">
        <div style="
          background:var(--card); border-radius:var(--r-lg) var(--r-lg) 0 0;
          width:100%; max-width:500px; padding:var(--sp-5);
          box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
          animation: slideUp 0.3s var(--transition-spring);
          max-height: 88vh; overflow-y: auto;
        ">
          <!-- Handle bar -->
          <div style="width:40px; height:4px; background:var(--border); border-radius:2px; margin:0 auto var(--sp-4)"></div>

          <!-- Header -->
          <div style="display:flex; align-items:center; gap:var(--sp-4); margin-bottom:var(--sp-4)">
            <div style="width:60px; height:60px; border-radius:50%; background:${p.avatarColor};
              display:flex; align-items:center; justify-content:center;
              font-size:20px; font-weight:700; color:white; flex-shrink:0;
              box-shadow: 0 4px 12px ${p.avatarColor}66">
              ${DB.getInitials(p.name)}
            </div>
            <div style="flex:1;">
              <div style="font-size:18px; font-weight:800; color:var(--text)">${p.name}</div>
              <div style="font-size:13px; color:var(--text-muted)">${DB.getDayOfWeekName(p.dayOfWeek)} às ${p.time}</div>
              <div style="font-size:12px; margin-top:2px; color:${isOverdue ? '#F43F5E' : '#10B981'}; font-weight:600">
                ${isOverdue ? '⚠️ Pagamento em aberto este mês' : '✅ Pagamento em dia'}
              </div>
            </div>
            <button onclick="window.PatientsPage.closeModal()" style="color:var(--text-muted); font-size:22px; padding:4px;">✕</button>
          </div>

          <div id="patient-modal-body" data-patient-id="${p.id}">
            ${renderModalBody(p)}
          </div>
        </div>
      </div>
    `;
  }

  function openModal(id) {
    activeTab = 'overview';
    const p = DB.getPatients().find(p => p.id === id);
    if (!p) return;
    const existing = document.getElementById('patient-modal-overlay');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', renderProfileModal(p));
    bindModalEvents(p);
  }

  function closeModal() {
    const modal = document.getElementById('patient-modal-overlay');
    if (modal) modal.remove();
  }

  function deleteEvolution(id) {
    if (confirm('Deseja excluir esta anotação do prontuário?')) {
      DB.deleteEvolution(id);
      App.toast('Anotação excluída.', 'success');
      const pId = document.getElementById('patient-modal-body')?.getAttribute('data-patient-id');
      if (pId) {
        const p = DB.getPatient(pId);
        if (p) {
          document.getElementById('patient-modal-body').innerHTML = renderModalBody(p);
          bindModalEvents(p);
        }
      }
    }
  }

  // ─── DOCUMENT GENERATION ────────────────────────────────────
  function generateReceipt(patientId) {
    const p = DB.getPatient(patientId);
    const settings = DB.getSettings();
    if (!p) return;

    const docName = settings.doctorName || 'Psicólogo(a)';
    const crp = settings.crp ? `CRP: ${settings.crp}` : 'CRP: Não informado';
    const today = new Date().toLocaleDateString('pt-BR');
    const value = p.valuePerSession || 0;
    const formattedVal = DB.formatCurrency(value);

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Recibo de Pagamento - ${p.name}</title>
      <style>
        body { font-family: 'Inter', sans-serif, Arial; padding: 40px; color: #1e293b; max-width: 650px; margin: 0 auto; line-height: 1.6; }
        .receipt-card { border: 2px solid #4F46E5; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 22px; font-weight: 800; color: #4F46E5; text-transform: uppercase; letter-spacing: 1px; }
        .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
        .body-text { font-size: 15px; margin-bottom: 32px; text-align: justify; }
        .amount-box { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px; padding: 12px 20px; font-size: 18px; font-weight: 800; color: #4338CA; text-align: center; margin: 20px 0; }
        .signature-area { margin-top: 50px; text-align: center; }
        .signature-line { width: 260px; border-top: 1px solid #1e293b; margin: 0 auto 8px; }
        .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; }
        @media print { .no-print { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div class="title">Recibo de Honorários Psicológicos</div>
          <div class="subtitle">${docName} · ${crp}</div>
        </div>
        
        <div class="amount-box">VALOR: ${formattedVal}</div>

        <div class="body-text">
          Recebi de <strong>${p.name}</strong>${p.cpf ? `, inscrito(a) no CPF sob o nº <strong>${p.cpf}</strong>` : ''}, a quantia de <strong>${formattedVal}</strong>, referente à prestação de serviços profissionais de psicoterapia clínica.
        </div>

        <div style="font-size: 14px; margin-bottom: 40px;">
          Data de emissão: <strong>${today}</strong>
        </div>

        <div class="signature-area">
          <div class="signature-line"></div>
          <strong>${docName}</strong><br>
          <span style="font-size: 13px; color: #64748b;">${crp}</span>
        </div>

        <div class="footer">Documento emitido via PsyAssist • Gestão Clínica para Psicólogos</div>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 24px;">
        <button onclick="window.print()" style="background: #4F46E5; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer;">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>
    </body>
    </html>`);
    w.document.close();
  }

  function generateDeclaration(patientId) {
    const p = DB.getPatient(patientId);
    const settings = DB.getSettings();
    if (!p) return;

    const docName = settings.doctorName || 'Psicólogo(a)';
    const crp = settings.crp ? `CRP: ${settings.crp}` : 'CRP: Não informado';
    const today = new Date().toLocaleDateString('pt-BR');

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Declaração de Comparecimento - ${p.name}</title>
      <style>
        body { font-family: 'Inter', sans-serif, Arial; padding: 40px; color: #1e293b; max-width: 650px; margin: 0 auto; line-height: 1.7; }
        .card { border: 2px solid #10B981; border-radius: 12px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 28px; }
        .title { font-size: 20px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
        .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
        .body-text { font-size: 15px; margin-bottom: 32px; text-align: justify; }
        .signature-area { margin-top: 60px; text-align: center; }
        .signature-line { width: 260px; border-top: 1px solid #1e293b; margin: 0 auto 8px; }
        .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; }
        @media print { .no-print { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title">Declaração de Comparecimento</div>
          <div class="subtitle">${docName} · ${crp}</div>
        </div>

        <div class="body-text">
          Declaro para os devidos fins de comprovação que <strong>${p.name}</strong>${p.cpf ? `, inscrito(a) no CPF nº <strong>${p.cpf}</strong>` : ''}, compareceu ao atendimento psicoterapêutico no dia <strong>${today}</strong> no horário das <strong>${p.time || '00:00'}</strong>.
        </div>

        <div style="font-size: 14px; margin-bottom: 40px;">
          Local e data: <strong>${today}</strong>
        </div>

        <div class="signature-area">
          <div class="signature-line"></div>
          <strong>${docName}</strong><br>
          <span style="font-size: 13px; color: #64748b;">${crp}</span>
        </div>

        <div class="footer">Documento emitido para fins justificatórios de atendimento clínico • Resolução CFP</div>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 24px;">
        <button onclick="window.print()" style="background: #10B981; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer;">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>
    </body>
    </html>`);
    w.document.close();
  }

  function render() {
    const patients = DB.getPatients();
    const month = DB.getCurrentMonth();
    DB.ensureMonthPayments(month);
    const payments = DB.getPaymentsByMonth(month);

    // Sort: active first, overdue first, then name
    patients.sort((a, b) => {
      if (a.active !== b.active) return b.active - a.active;
      const aOverdue = !payments.find(p => p.patientId === a.id)?.paid;
      const bOverdue = !payments.find(p => p.patientId === b.id)?.paid;
      if (aOverdue !== bOverdue) return bOverdue ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    let html = `
      <div class="page-container" style="padding-bottom:120px;">
        <div class="page-header">
          <h1 class="page-header__title">Meus <span>Pacientes</span></h1>
          <p style="font-size:13px; color:var(--text-muted); margin-top:2px;">Toque no paciente para ver o prontuário, WhatsApp e recibos.</p>
        </div>
        
        <div class="search-bar" style="margin-bottom:16px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="patient-search" placeholder="Buscar por nome do paciente...">
        </div>
        
        <div class="patient-list" id="patients-wrapper">
    `;
    
    if (patients.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state__icon">👥</div>
          <div class="empty-state__title">Nenhum paciente cadastrado</div>
          <div class="empty-state__text">Cadastre seu primeiro paciente usando o botão + abaixo ou a aba Agendar.</div>
          <button onclick="Router.navigate('book')" class="btn btn-primary" style="margin-top:16px;">
            + Cadastrar Paciente
          </button>
        </div>
      `;
    } else {
      patients.forEach(p => {
        const pay = payments.find(pay => pay.patientId === p.id);
        const isOverdue = p.active && pay && !pay.paid;
        html += renderPatientCard(p, isOverdue);
      });
    }

    html += `
        </div>
      </div>
      
      <button class="fab" onclick="Router.navigate('book')" title="Cadastrar Paciente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    `;
    
    return html;
  }

  function renderPatientCard(p, isOverdue) {
    return `
      <div class="patient-card ${p.active ? (isOverdue ? 'patient-card--pending' : 'patient-card--paid') : 'patient-card--inactive'} patient-item-card"
        data-name="${p.name.toLowerCase()}"
        onclick="window.PatientsPage.openModal('${p.id}')"
        style="cursor:pointer; position:relative; transition:transform 0.15s ease;">
        
        ${isOverdue ? `<div style="position:absolute; top:12px; right:12px; width:8px; height:8px; background:#F43F5E; border-radius:50%; box-shadow:0 0 0 3px rgba(244,63,94,0.2)" title="Pagamento pendente"></div>` : ''}
        
        <div class="patient-avatar" style="background: ${p.active ? p.avatarColor : 'var(--border)'}; font-size:15px; font-weight:700;">
          ${DB.getInitials(p.name)}
        </div>
        <div class="patient-info">
          <div class="patient-name" style="${!p.active ? 'text-decoration: line-through; color: var(--text-muted)' : ''}">${p.name}</div>
          <div class="patient-meta">
            ${p.active ? `${DB.getDayOfWeekName(p.dayOfWeek)} às ${p.time}` : 'Inativo na agenda'}
            ${p.modality === 'online' ? ' · 💻' : ' · 🏢'}
            ${isOverdue ? ' · <span style="color:#F43F5E;font-weight:700">Pendente</span>' : ''}
          </div>
        </div>
        <div class="patient-card__actions">
          <div class="chip ${p.active ? (isOverdue ? 'chip--pending' : 'chip--paid') : 'chip--inactive'}">${DB.formatCurrency(p.valuePerSession || 0)}</div>
        </div>
      </div>
    `;
  }

  function editPatient(id) {
    if (window.BookPage) {
      window.BookPage.setEditId(id);
      Router.navigate('book');
    }
  }

  function onEnter() {
    const searchInput = document.getElementById('patient-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.patient-item-card').forEach(card => {
          const name = card.getAttribute('data-name');
          card.style.display = name.includes(query) ? '' : 'none';
        });
      });
    }

    return window.Store?.subscribe('db:change', () => Router.refresh());
  }

  return {
    render, onEnter, editPatient, openModal, closeModal,
    setModalTab, deleteEvolution, generateReceipt, generateDeclaration
  };
})();

window.PatientsPage = PatientsPage;
