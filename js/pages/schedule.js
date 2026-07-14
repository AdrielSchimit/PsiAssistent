// PsyAssist — Schedule Page

const SchedulePage = (() => {
  let currentDate = new Date();
  
  function render() {
    const weekStart = DB.getWeekStart(currentDate);
    const weekDays = DB.getWeekDays(weekStart); // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    const currentMonthLabel = DB.formatMonth(weekStart.slice(0, 7));
    
    // Render week navigation
    let html = `
      <div class="page-container" style="padding-bottom:100px;">
        <div class="page-header">
          <h1 class="page-header__title">Minha <span>Agenda</span></h1>
        </div>
        
        <div class="week-nav">
          <button class="week-nav__btn" id="week-prev">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="week-nav__title">${currentMonthLabel}</div>
          <button class="week-nav__btn" id="week-next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
    `;

    const patients = DB.getActivePatients();
    
    // Create days array (0 = Sunday, 1 = Monday, etc.)
    // weekDays maps to: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
    const dowMap = [1, 2, 3, 4, 5, 6, 0];
    const todayStr = new Date().toISOString().slice(0, 10);

    let hasAnySession = false;

    weekDays.forEach((dateStr, i) => {
      const dow = dowMap[i];
      // Find patients for this day of week
      let daySessions = patients.filter(p => parseInt(p.dayOfWeek) === dow);
      // Sort by time
      daySessions.sort((a, b) => a.time.localeCompare(b.time));

      if (daySessions.length > 0) {
        hasAnySession = true;
        const isToday = dateStr === todayStr;
        const [y, m, d] = dateStr.split('-');
        
        html += `
          <div class="day-group">
            <div class="day-label ${isToday ? 'day-label--today' : ''}">
              <div class="day-dot"></div>
              ${DB.getDayName(dateStr)} ${d}/${m} ${isToday ? '(Hoje)' : ''}
            </div>
        `;

        daySessions.forEach(p => {
          const isCancelled = DB.isSessionCancelled(p.id, weekStart);
          html += `
            <div class="session-item ${isCancelled ? 'session-item--cancelled' : ''}">
              <div class="session-time">${p.time}</div>
              <div class="session-patient">
                <div class="session-patient__name">${p.name}</div>
                <div class="session-patient__status">${isCancelled ? 'Cancelado' : 'Confirmado'}</div>
              </div>
              <div class="cancel-toggle ${isCancelled ? 'cancelled' : 'active'}" data-pid="${p.id}" data-ws="${weekStart}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  ${isCancelled 
                    ? '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' 
                    : '<polyline points="20 6 9 17 4 12"></polyline>'}
                </svg>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }
    });

    if (!hasAnySession) {
      html += `
        <div class="empty-state">
          <div class="empty-state__icon">☕</div>
          <div class="empty-state__title">Semana Livre</div>
          <div class="empty-state__text">Nenhuma sessão agendada para esta semana.</div>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  function onEnter() {
    document.getElementById('week-prev').addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() - 7);
      Router.navigate('schedule', false);
    });
    
    document.getElementById('week-next').addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() + 7);
      Router.navigate('schedule', false);
    });

    document.querySelectorAll('.cancel-toggle').forEach(el => {
      el.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const pid = btn.getAttribute('data-pid');
        const ws = btn.getAttribute('data-ws');
        const isNowActive = DB.toggleCancel(pid, ws);
        
        // Re-render
        Router.navigate('schedule', false);
        App.toast(isNowActive ? 'Sessão reativada' : 'Sessão cancelada', isNowActive ? 'success' : 'error');
      });
    });
  }

  return { render, onEnter };
})();

window.SchedulePage = SchedulePage;
