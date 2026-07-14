// PsyAssist — Finance Page

const FinancePage = (() => {
  let currentMonthStr = DB.getCurrentMonth(); // YYYY-MM

  function render() {
    DB.ensureMonthPayments(currentMonthStr);
    const summary = DB.getMonthSummary(currentMonthStr);
    const payments = DB.getPaymentsByMonth(currentMonthStr);
    const patients = DB.getPatients(); // all patients to get names
    
    const progressPercent = summary.total > 0 ? (summary.received / summary.total) * 100 : 0;
    
    let html = `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-header__title">Painel <span>Financeiro</span></h1>
        </div>
        
        <div class="month-picker">
          <button class="icon-btn" id="fin-prev">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="month-picker__title">${DB.formatMonth(currentMonthStr)}</div>
          <button class="icon-btn" id="fin-next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        
        <div class="finance-hero">
          <div class="finance-hero__label">Recebido no mês</div>
          <div class="finance-hero__amount"><sup>R$</sup>${summary.received.toFixed(2).replace('.', ',')}</div>
          
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
          
          <div class="finance-hero__meta">
            <div class="finance-meta-item">
              <div class="finance-meta-item__label">A Receber</div>
              <div class="finance-meta-item__value">R$ ${summary.pending.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="finance-meta-item">
              <div class="finance-meta-item__label">Total Previsto</div>
              <div class="finance-meta-item__value">R$ ${summary.total.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>

        <div class="section-header">
          <h2 class="section-title" style="margin:0">Controle de Pacientes</h2>
        </div>
        
        <div class="patient-list">
    `;

    // Active payments first
    payments.forEach(pay => {
      const p = patients.find(pat => pat.id === pay.patientId);
      if (!p || !p.active) return; // Only show active patients for billing
      
      html += `
        <div class="patient-card ${pay.paid ? 'patient-card--paid' : 'patient-card--pending'}">
          <div class="patient-avatar" style="background: ${p.avatarColor}; width:40px; height:40px; font-size:14px;">
            ${DB.getInitials(p.name)}
          </div>
          <div class="patient-info">
            <div class="patient-name">${p.name}</div>
            <div class="patient-meta">${DB.formatCurrency(pay.value)}/mês</div>
          </div>
          <div class="patient-card__actions">
            ${pay.paid 
              ? `<div class="chip chip--paid toggle-pay" data-pid="${p.id}" style="cursor:pointer">Pago</div>`
              : `<div class="chip chip--pending toggle-pay" data-pid="${p.id}" style="cursor:pointer">Pendente</div>`
            }
          </div>
          
          ${!pay.paid ? `
            <button class="btn-icon btn-whatsapp" style="margin-left: 8px; width: 32px; height: 32px;" onclick="window.WhatsApp.sendReminder(${JSON.stringify(p).replace(/"/g, '&quot;')}, ${pay.value})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </button>
          ` : ''}
        </div>
      `;
    });
    
    if (payments.filter(pay => patients.find(pat => pat.id === pay.patientId)?.active).length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state__icon">💰</div>
          <div class="empty-state__text">Nenhum paciente ativo para cobrança neste mês.</div>
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
    document.getElementById('fin-prev').addEventListener('click', () => {
      currentMonthStr = DB.prevMonth(currentMonthStr);
      Router.navigate('finance', false);
    });
    
    document.getElementById('fin-next').addEventListener('click', () => {
      currentMonthStr = DB.nextMonth(currentMonthStr);
      Router.navigate('finance', false);
    });

    document.querySelectorAll('.toggle-pay').forEach(el => {
      el.addEventListener('click', (e) => {
        const pid = e.currentTarget.getAttribute('data-pid');
        const updated = DB.togglePayment(pid, currentMonthStr);
        Router.navigate('finance', false);
        if (updated) {
          App.toast(updated.paid ? 'Marcado como Pago' : 'Marcado como Pendente', updated.paid ? 'success' : 'warning');
        }
      });
    });
  }

  return { render, onEnter };
})();

window.FinancePage = FinancePage;
