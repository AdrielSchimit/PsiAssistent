// PsyAssist — Patients Page

const PatientsPage = (() => {
  function render() {
    const patients = DB.getPatients();
    
    // Sort active first, then alphabetically
    patients.sort((a, b) => {
      if (a.active !== b.active) return b.active - a.active;
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
        html += renderPatientCard(p);
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

  function renderPatientCard(p) {
    return `
      <div class="patient-card ${p.active ? 'patient-card--paid' : 'patient-card--inactive'} patient-item-card" data-name="${p.name.toLowerCase()}" onclick="window.PatientsPage.editPatient('${p.id}')">
        <div class="patient-avatar" style="background: ${p.active ? p.avatarColor : 'var(--border)'}">
          ${DB.getInitials(p.name)}
        </div>
        <div class="patient-info">
          <div class="patient-name" style="${!p.active ? 'text-decoration: line-through; color: var(--text-muted)' : ''}">${p.name}</div>
          <div class="patient-meta">
            ${p.active ? `${DB.getDayOfWeekName(p.dayOfWeek)} às ${p.time}` : 'Inativo'}
          </div>
        </div>
        <div class="patient-card__actions">
          <div class="chip ${p.active ? 'chip--primary' : 'chip--inactive'}">${DB.formatCurrency(p.valuePerSession)}</div>
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
          if (name.includes(query)) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    }
  }

  return { render, onEnter, editPatient };
})();

window.PatientsPage = PatientsPage;
