// PsyAssist — Home Page

const HomePage = (() => {
  function render() {
    const month = DB.getCurrentMonth();
    const summary = DB.getMonthSummary(month);
    const patients = DB.getActivePatients();
    
    // Calculate today's sessions
    const todayNum = new Date().getDay();
    const todaySessions = patients.filter(p => parseInt(p.dayOfWeek) === todayNum);

    return `
      <div class="page-container">
        <div class="page-header">
          <div class="page-header__greeting">Olá, Dr(a).</div>
          <h1 class="page-header__title">Psy<span>Assist</span></h1>
        </div>
        
        ${todaySessions.length > 0 ? `
        <div class="today-banner">
          <div class="today-banner__icon">🗓️</div>
          <div class="today-banner__text">
            <div class="today-banner__title">Você tem ${todaySessions.length} sessão(ões) hoje</div>
            <div class="today-banner__subtitle">Confira sua agenda para mais detalhes</div>
          </div>
        </div>
        ` : ''}

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <div class="stat-card__value">${patients.length}</div>
            <div class="stat-card__label">Pacientes Ativos</div>
          </div>
          
          <div class="stat-card" style="cursor:pointer;" onclick="Router.navigate('finance')">
            <div class="stat-card__icon stat-card__icon--success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-card__value">${DB.formatCurrency(summary.received).replace(/,00/g, '').replace('R$', '').trim()}</div>
            <div class="stat-card__label">Recebido este Mês</div>
          </div>
        </div>
        
        <div class="section-header mt-4">
          <h2 class="section-title">Acesso Rápido</h2>
        </div>
        
        <div class="quick-actions">
          <div class="quick-action" onclick="Router.navigate('book')">
            <div class="quick-action__icon" style="color: var(--primary-light)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div class="quick-action__label">Novo<br>Paciente</div>
          </div>
          <div class="quick-action" onclick="Router.navigate('schedule')">
            <div class="quick-action__icon" style="color: var(--warning)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div class="quick-action__label">Minha<br>Agenda</div>
          </div>
          <div class="quick-action" onclick="Router.navigate('patients')">
            <div class="quick-action__icon" style="color: var(--success)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="quick-action__label">Meus<br>Pacientes</div>
          </div>
          <div class="quick-action" onclick="Router.navigate('finance')">
            <div class="quick-action__icon" style="color: #60A5FA">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <div class="quick-action__label">Painel<br>Financeiro</div>
          </div>
        </div>

        <div class="section-header mt-4">
          <h2 class="section-title">Cobranças Pendentes</h2>
          <div class="see-all" onclick="Router.navigate('finance')">Ver Financeiro</div>
        </div>
        
        <div class="patient-list" id="home-pending-list">
          ${renderPendingList(month)}
        </div>
        
      </div>
    `;
  }

  function renderPendingList(month) {
    const payments = DB.getPaymentsByMonth(month).filter(p => !p.paid);
    const patients = DB.getActivePatients();
    
    if (payments.length === 0) {
      return `
        <div class="card text-center" style="padding: var(--sp-6) var(--sp-4);">
          <div style="font-size:32px; margin-bottom:8px">🎉</div>
          <div style="font-weight:600; color:var(--text)">Tudo em dia!</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px">Nenhuma cobrança pendente para este mês.</div>
        </div>
      `;
    }

    let html = '';
    payments.forEach(pay => {
      const p = patients.find(pat => pat.id === pay.patientId);
      if (!p) return;
      html += `
        <div class="finance-row">
          <div class="finance-row__info">
            <div class="finance-row__name">${p.name}</div>
            <div class="finance-row__amount">${DB.formatCurrency(pay.value)}</div>
          </div>
          <div class="finance-row__status">
            <button class="btn btn-whatsapp btn-sm" style="border-radius:var(--r-lg); padding: 8px 12px; font-size:12px;" onclick="window.WhatsApp.sendReminder(${JSON.stringify(p).replace(/"/g, '&quot;')}, ${pay.value})">
              Cobrar
            </button>
          </div>
        </div>
      `;
    });
    return html;
  }

  function onEnter() {
    return window.Store.subscribe('db:change', ({ type }) => {
      if (type === 'db:patients' || type === 'db:payments') Router.refresh();
    });
  }

  return { render, onEnter };
})();

window.HomePage = HomePage;
