// PsyAssist — Finance Page

const FinancePage = (() => {
  let currentMonthStr = DB.getCurrentMonth(); // YYYY-MM
  let financeFilter = 'all'; // 'all' | 'pending' | 'paid'

  function setFilter(filter) {
    financeFilter = filter;
    Router.navigate('finance', false);
  }

  function render() {
    DB.ensureMonthPayments(currentMonthStr);
    const summary = DB.getMonthSummary(currentMonthStr);
    const payments = DB.getPaymentsByMonth(currentMonthStr);
    const patients = DB.getPatients(); // all patients to get names
    
    const progressPercent = summary.total > 0 ? (summary.received / summary.total) * 100 : 0;
    
    // Filter active patients payments
    const activePayments = payments.filter(pay => {
      const p = patients.find(pat => pat.id === pay.patientId);
      return p && p.active;
    });

    const pendingList = activePayments.filter(p => !p.paid);
    const paidList = activePayments.filter(p => p.paid);

    let displayPayments = activePayments;
    if (financeFilter === 'pending') displayPayments = pendingList;
    if (financeFilter === 'paid') displayPayments = paidList;

    let html = `
      <div class="page-container" style="padding-bottom:120px;">
        <div class="page-header">
          <h1 class="page-header__title">Painel <span>Financeiro</span></h1>
        </div>
        
        <div class="month-picker" style="box-shadow:var(--shadow-sm); border:1px solid var(--border);">
          <button class="icon-btn" id="fin-prev">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="month-picker__title" style="font-weight:700;">${DB.formatMonth(currentMonthStr)}</div>
          <button class="icon-btn" id="fin-next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        
        <div class="finance-hero" style="box-shadow:var(--shadow-md);">
          <div class="finance-hero__label">Recebido no Mês</div>
          <div class="finance-hero__amount"><sup>R$</sup>${summary.received.toFixed(2).replace('.', ',')}</div>
          
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
          
          <div class="finance-hero__meta">
            <div class="finance-meta-item">
              <div class="finance-meta-item__label">A Receber (Pendente)</div>
              <div class="finance-meta-item__value" style="color:${summary.pending > 0 ? '#F43F5E' : 'inherit'};">
                R$ ${summary.pending.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div class="finance-meta-item">
              <div class="finance-meta-item__label">Total Previsto</div>
              <div class="finance-meta-item__value">R$ ${summary.total.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>

        <div class="section-header" style="margin-top:24px; margin-bottom:12px;">
          <h2 class="section-title" style="margin:0">Controle de Honorários</h2>
        </div>

        <!-- Filter Tabs -->
        <div style="display:flex; gap:8px; margin-bottom:16px;">
          <button onclick="window.FinancePage.setFilter('all')" class="chip ${financeFilter === 'all' ? 'chip--paid' : ''}" style="cursor:pointer; padding:8px 14px; font-weight:700; border:1px solid ${financeFilter === 'all' ? 'transparent' : 'var(--border)'};">
            Todos (${activePayments.length})
          </button>
          <button onclick="window.FinancePage.setFilter('pending')" class="chip ${financeFilter === 'pending' ? 'chip--pending' : ''}" style="cursor:pointer; padding:8px 14px; font-weight:700; border:1px solid ${financeFilter === 'pending' ? 'transparent' : 'var(--border)'};">
            🚨 Pendentes (${pendingList.length})
          </button>
          <button onclick="window.FinancePage.setFilter('paid')" class="chip ${financeFilter === 'paid' ? 'chip--paid' : ''}" style="cursor:pointer; padding:8px 14px; font-weight:700; border:1px solid ${financeFilter === 'paid' ? 'transparent' : 'var(--border)'};">
            ✅ Pagos (${paidList.length})
          </button>
        </div>
        
        <div class="patient-list">
    `;

    displayPayments.forEach(pay => {
      const p = patients.find(pat => pat.id === pay.patientId);
      if (!p) return;
      
      html += `
        <div class="patient-card ${pay.paid ? 'patient-card--paid' : 'patient-card--pending'}" style="align-items:center;">
          <div class="patient-avatar" style="background: ${p.avatarColor}; width:44px; height:44px; font-size:15px; font-weight:700;">
            ${DB.getInitials(p.name)}
          </div>
          <div class="patient-info" style="cursor:pointer;" onclick="window.PatientsPage.openModal('${p.id}')">
            <div class="patient-name">${p.name}</div>
            <div class="patient-meta">${DB.formatCurrency(pay.value)}/mês · ${p.modality === 'online' ? '💻 Online' : '🏢 Presencial'}</div>
          </div>
          <div class="patient-card__actions" style="display:flex; align-items:center; gap:8px;">
            <div class="chip ${pay.paid ? 'chip--paid' : 'chip--pending'} toggle-pay" data-pid="${p.id}" style="cursor:pointer; font-weight:700; padding:6px 12px;" title="Clique para alternar pago/pendente">
              ${pay.paid ? '✅ Pago' : '⏳ Pendente'}
            </div>
            
            ${!pay.paid ? `
              <button class="btn-icon btn-whatsapp" style="width: 36px; height: 36px; border-radius:10px; background:#25D366; color:white; display:flex; align-items:center; justify-content:center;" onclick="window.WhatsApp.sendReminder(${JSON.stringify(p).replace(/"/g, '&quot;')}, ${pay.value})" title="Enviar cobrança educada pelo WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });
    
    if (displayPayments.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state__icon">🎉</div>
          <div class="empty-state__title">${financeFilter === 'pending' ? 'Nenhuma cobrança pendente!' : 'Nenhum registro encontrado'}</div>
          <div class="empty-state__text">${financeFilter === 'pending' ? 'Todos os pacientes ativos estão com o pagamento em dia neste mês.' : 'Nenhum paciente cadastrado para este mês.'}</div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
    
    return html;
  }

  function onEnter() {
    document.getElementById('fin-prev')?.addEventListener('click', () => {
      currentMonthStr = DB.prevMonth(currentMonthStr);
      Router.navigate('finance', false);
    });
    
    document.getElementById('fin-next')?.addEventListener('click', () => {
      currentMonthStr = DB.nextMonth(currentMonthStr);
      Router.navigate('finance', false);
    });

    document.querySelectorAll('.toggle-pay').forEach(el => {
      el.addEventListener('click', (e) => {
        const pid = e.currentTarget.getAttribute('data-pid');
        const updated = DB.togglePayment(pid, currentMonthStr);
        if (updated) {
          App.toast(updated.paid ? 'Marcado como Pago ✅' : 'Marcado como Pendente ⏳', updated.paid ? 'success' : 'warning');
        }
      });
    });

    return window.Store.subscribe('db:change', ({ type }) => {
      if (type === 'db:patients' || type === 'db:payments') Router.refresh();
    });
  }

  return { render, onEnter, setFilter };
})();

window.FinancePage = FinancePage;
