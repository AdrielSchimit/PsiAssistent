// PsyAssist — Patients Page

const PatientsPage = (() => {

  // === #14 Patient slide-up profile modal ===
  function renderProfileModal(p) {
    const settings = DB.getSettings();
    const month = DB.getCurrentMonth();
    DB.ensureMonthPayments(month);
    const payments = DB.getPaymentsByMonth(month);
    const pay = payments.find(pay => pay.patientId === p.id);
    const isPaid = pay?.paid;
    const isOverdue = !isPaid;

    // Days since last paid (simulate with month data)
    const overdueLabel = isOverdue ? '⚠️ Pendente este mês' : '✅ Pago este mês';

    return `
      <div id="patient-modal-overlay" onclick="if(event.target===this)window.PatientsPage.closeModal()" style="
        position:fixed; inset:0; z-index:1000;
        background:rgba(0,0,0,0.4); backdrop-filter:blur(4px);
        display:flex; align-items:flex-end; justify-content:center;
        animation: fadeIn 0.2s ease;
      ">
        <div style="
          background:var(--card); border-radius:var(--r-lg) var(--r-lg) 0 0;
          width:100%; max-width:480px; padding:var(--sp-5);
          box-shadow: 0 -8px 40px rgba(0,0,0,0.15);
          animation: slideUp 0.3s var(--transition-spring);
          max-height: 85vh; overflow-y: auto;
        ">
          <!-- Handle bar -->
          <div style="width:40px; height:4px; background:var(--border); border-radius:2px; margin:0 auto var(--sp-4)"></div>

          <!-- Header -->
          <div style="display:flex; align-items:center; gap:var(--sp-4); margin-bottom:var(--sp-5)">
            <div style="width:64px; height:64px; border-radius:50%; background:${p.avatarColor};
              display:flex; align-items:center; justify-content:center;
              font-size:22px; font-weight:700; color:white; flex-shrink:0;
              box-shadow: 0 4px 12px ${p.avatarColor}66">
              ${DB.getInitials(p.name)}
            </div>
            <div>
              <div style="font-size:18px; font-weight:700; color:var(--text)">${p.name}</div>
              <div style="font-size:13px; color:var(--text-muted)">${DB.getDayOfWeekName(p.dayOfWeek)} às ${p.time}</div>
              <div style="font-size:12px; margin-top:4px; color:${isOverdue ? '#F43F5E' : '#10B981'}; font-weight:600">${overdueLabel}</div>
            </div>
          </div>

          <!-- Stats row -->
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:var(--sp-4)">
            <div style="background:var(--surface); border-radius:var(--r-md); padding:12px; text-align:center">
              <div style="font-size:18px; font-weight:700; color:var(--primary)">${DB.formatCurrency(p.valuePerSession)}</div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px">Por sessão</div>
            </div>
            <div style="background:var(--surface); border-radius:var(--r-md); padding:12px; text-align:center">
              <div style="font-size:18px; font-weight:700; color:var(--text)">${p.active ? '✅' : '❌'}</div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px">${p.active ? 'Ativo' : 'Inativo'}</div>
            </div>
            <div style="background:var(--surface); border-radius:var(--r-md); padding:12px; text-align:center">
              <div style="font-size:18px; font-weight:700; color:${isOverdue ? '#F43F5E' : '#10B981'}">${isOverdue ? '⏳' : '💚'}</div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px">Pagamento</div>
            </div>
          </div>

          ${p.notes ? `
          <!-- Notes -->
          <div style="background:var(--surface); border-radius:var(--r-md); padding:var(--sp-3); margin-bottom:var(--sp-4)">
            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:6px">Anotações</div>
            <div style="font-size:13px; color:var(--text); line-height:1.5">${p.notes}</div>
          </div>` : ''}

          <!-- WhatsApp templates -->
          <div style="margin-bottom:var(--sp-4)">
            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:8px">Enviar Mensagem</div>
            <div style="display:flex; flex-direction:column; gap:8px">
              ${Object.entries(WhatsApp.getTemplateLabels()).map(([key, label]) => `
                <button onclick="window.WhatsApp.sendByKey(${JSON.stringify(p).replace(/"/g, '&quot;')}, ${p.valuePerSession}, '${key}'); window.PatientsPage.closeModal()" style="
                  background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md);
                  padding:10px 14px; text-align:left; font-size:13px; color:var(--text); cursor:pointer;
                  display:flex; align-items:center; gap:8px; transition: all 0.2s;
                " onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
                  ${label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:8px">
            <button onclick="window.PatientsPage.editPatient('${p.id}'); window.PatientsPage.closeModal()" class="btn btn-primary" style="flex:1">
              ✏️ Editar Paciente
            </button>
            <button onclick="window.PatientsPage.closeModal()" style="
              background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md);
              padding:0 16px; font-size:14px; cursor:pointer; color:var(--text)
            ">Fechar</button>
          </div>
        </div>
      </div>
    `;
  }

  function openModal(id) {
    const p = DB.getPatients().find(p => p.id === id);
    if (!p) return;
    const existing = document.getElementById('patient-modal-overlay');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', renderProfileModal(p));
  }

  function closeModal() {
    const modal = document.getElementById('patient-modal-overlay');
    if (modal) modal.remove();
  }

  function render() {
    const patients = DB.getPatients();
    const month = DB.getCurrentMonth();
    DB.ensureMonthPayments(month);
    const payments = DB.getPaymentsByMonth(month);

    // Sort: overdue active first, then paid, then inactive
    patients.sort((a, b) => {
      if (a.active !== b.active) return b.active - a.active;
      const aOverdue = !payments.find(p => p.patientId === a.id)?.paid;
      const bOverdue = !payments.find(p => p.patientId === b.id)?.paid;
      if (aOverdue !== bOverdue) return bOverdue ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    let html = `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-header__title">Meus <span>Pacientes</span></h1>
        </div>
        
        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="patient-search" placeholder="Buscar paciente...">
        </div>
        
        <div class="patient-list" id="patients-wrapper">
    `;
    
    if (patients.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state__icon">👥</div>
          <div class="empty-state__title">Nenhum paciente</div>
          <div class="empty-state__text">Cadastre seu primeiro paciente usando o botão + no menu inferior.</div>
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
      
      <button class="fab" onclick="Router.navigate('book')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        style="cursor:pointer; position:relative;">
        
        ${isOverdue ? `<div style="position:absolute; top:10px; right:10px; width:8px; height:8px; background:#F43F5E; border-radius:50%; box-shadow:0 0 0 3px rgba(244,63,94,0.2)"></div>` : ''}
        
        <div class="patient-avatar" style="background: ${p.active ? p.avatarColor : 'var(--border)'}">
          ${DB.getInitials(p.name)}
        </div>
        <div class="patient-info">
          <div class="patient-name" style="${!p.active ? 'text-decoration: line-through; color: var(--text-muted)' : ''}">${p.name}</div>
          <div class="patient-meta">
            ${p.active ? `${DB.getDayOfWeekName(p.dayOfWeek)} às ${p.time}` : 'Inativo'}
            ${isOverdue ? ' · <span style="color:#F43F5E;font-weight:600">Em aberto</span>' : ''}
          </div>
        </div>
        <div class="patient-card__actions">
          <div class="chip ${p.active ? (isOverdue ? 'chip--pending' : 'chip--paid') : 'chip--inactive'}">${DB.formatCurrency(p.valuePerSession)}</div>
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
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.patient-item-card').forEach(card => {
          const name = card.getAttribute('data-name');
          card.style.display = name.includes(query) ? '' : 'none';
        });
      });
    }

    return window.Store?.subscribe('db:change', () => Router.refresh());
  }

  return { render, onEnter, editPatient, openModal, closeModal };
})();

window.PatientsPage = PatientsPage;
