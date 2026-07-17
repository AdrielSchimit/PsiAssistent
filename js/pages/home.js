// PsyAssist — Home Page

const HomePage = (() => {
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function render() {
    const month = DB.getCurrentMonth();
    DB.ensureMonthPayments(month);
    const summary = DB.getMonthSummary(month);
    const patients = DB.getActivePatients();
    const settings = DB.getSettings();
    const docName = (settings.doctorName || 'Doutor(a)').split(' ')[0];

    // === #13 Tema adaptativo por horário ===
    const h = new Date().getHours();
    let autoTheme = null;
    if (!settings.theme) {
      if (h >= 6 && h < 12) autoTheme = 'indigo';
      else if (h >= 12 && h < 18) autoTheme = 'emerald';
      else autoTheme = 'graphite';
      document.documentElement.setAttribute('data-theme', autoTheme);
    }

    const todayNum = new Date().getDay();
    const todaySessions = patients.filter(p => parseInt(p.dayOfWeek) === todayNum);

    // === #8 Alerta de inadimplência ===
    const pendingPayments = DB.getPaymentsByMonth(month).filter(p => !p.paid);
    const overduePatients = pendingPayments.map(pay =>
      patients.find(p => p.id === pay.patientId)
    ).filter(Boolean);

    return `
      <div class="page-container">
        <div class="page-header">
          <div class="page-header__greeting">${getGreeting()}, ${docName} 👋</div>
          <h1 class="page-header__title">Psy<span>Assist</span></h1>
        </div>
        
        ${todaySessions.length > 0 ? `
        <div class="today-banner" onclick="Router.navigate('schedule')" style="cursor:pointer">
          <div class="today-banner__icon">🗓️</div>
          <div class="today-banner__text">
            <div class="today-banner__title">Você tem ${todaySessions.length} sessão(ões) hoje</div>
            <div class="today-banner__subtitle">${todaySessions.map(p => p.name.split(' ')[0]).join(', ')}</div>
          </div>
        </div>
        ` : ''}

        ${overduePatients.length > 3 ? `
        <div style="background:linear-gradient(135deg,#F43F5E,#BE123C); border-radius:var(--r-md); padding:12px 16px; margin-bottom:16px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="Router.navigate('finance')">
          <span style="font-size:24px">🚨</span>
          <div>
            <div style="font-size:13px; font-weight:700; color:white">${overduePatients.length} pacientes em aberto este mês</div>
            <div style="font-size:11px; color:rgba(255,255,255,0.8)">Toque para ver o painel financeiro</div>
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

        <!-- #4 Modo Foco -->
        ${todaySessions.length > 0 ? `
        <button id="btn-focus-mode" onclick="window.HomePage.toggleFocus()" style="
          width:100%; background:linear-gradient(135deg,var(--primary),var(--primary-light));
          color:white; border:none; border-radius:var(--r-md); padding:14px;
          font-size:14px; font-weight:600; cursor:pointer; margin-bottom:16px;
          display:flex; align-items:center; justify-content:center; gap:8px;
          box-shadow: 0 4px 12px var(--primary-glow); transition: all 0.2s;
        ">
          🧘 Modo Foco — Iniciar Sessão
        </button>` : ''}

        <div id="focus-overlay" style="display:none; position:fixed; inset:0; z-index:999;
          background:var(--bg); flex-direction:column; align-items:center; justify-content:center;">
          <div style="text-align:center; padding:var(--sp-6)">
            <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:1px">Em atendimento</div>
            <div id="focus-patient-name" style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:32px"></div>
            <div id="focus-timer" style="font-size:72px; font-weight:800; font-family:monospace; color:var(--primary); letter-spacing:4px; margin-bottom:32px">00:00</div>
            <div style="font-size:13px; color:var(--text-muted); margin-bottom:32px">Sessão em andamento</div>
            <button onclick="window.HomePage.toggleFocus()" style="
              background:var(--surface); border:1px solid var(--border); border-radius:var(--r-full);
              padding:12px 32px; font-size:14px; font-weight:600; cursor:pointer; color:var(--text)
            ">⏹ Encerrar Sessão</button>
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

  let focusInterval = null;
  let focusSeconds = 0;
  let isFocusMode = false;

  function toggleFocus() {
    const overlay = document.getElementById('focus-overlay');
    if (!overlay) return;

    if (!isFocusMode) {
      // Start focus mode
      isFocusMode = true;
      focusSeconds = 0;
      overlay.style.display = 'flex';

      const patients = DB.getActivePatients();
      const todayNum = new Date().getDay();
      const todayPatient = patients.find(p => parseInt(p.dayOfWeek) === todayNum);
      const nameEl = document.getElementById('focus-patient-name');
      if (nameEl && todayPatient) nameEl.textContent = todayPatient.name;
      else if (nameEl) nameEl.textContent = 'Sessão Livre';

      const timerEl = document.getElementById('focus-timer');
      focusInterval = setInterval(() => {
        focusSeconds++;
        const m = String(Math.floor(focusSeconds / 60)).padStart(2, '0');
        const s = String(focusSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
      }, 1000);
    } else {
      // End focus mode
      isFocusMode = false;
      clearInterval(focusInterval);
      overlay.style.display = 'none';
      const m = Math.floor(focusSeconds / 60);
      App.toast(`Sessão encerrada! Duração: ${m} min`, 'success');
    }
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
    return window.Store?.subscribe('db:change', ({ type }) => {
      if (type === 'db:patients' || type === 'db:payments') Router.refresh();
    });
  }

  return { render, onEnter, toggleFocus };
})();

window.HomePage = HomePage;
