// PsyAssist — Settings Page

const SettingsPage = (() => {
  const THEMES = [
    { id: 'indigo', name: 'Índigo Clássico', color: '#4F46E5' },
    { id: 'emerald', name: 'Esmeralda', color: '#10B981' },
    { id: 'graphite', name: 'Grafite', color: '#334155' },
    { id: 'lavender', name: 'Lavanda', color: '#A855F7' },
    { id: 'rose', name: 'Rose Elegante', color: '#F43F5E' },
    { id: 'peach', name: 'Pêssego', color: '#F97316' }
  ];

  function render() {
    const settings = DB.getSettings();
    const template = window.WhatsApp.getTemplate();
    const currentTheme = settings.theme || 'indigo';
    
    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-header__title">Ajustes & <span>Perfil</span></h1>
        </div>
        
        <div class="profile-card">
          <div class="profile-avatar" style="cursor:pointer; overflow:hidden; position:relative; ${settings.avatar ? 'background:transparent' : ''}" onclick="document.getElementById('avatar-upload').click()" title="Alterar foto">
            ${settings.avatar ? `<img src="${settings.avatar}" style="width:100%; height:100%; object-fit:cover">` : ((settings.doctorName || 'Dr').replace(/[^a-zA-Z]/g,'').slice(0,2).toUpperCase())}
            <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.5); font-size:10px; height:18px; display:flex; align-items:center; justify-content:center; color:white">📷</div>
          </div>
          <div class="profile-info">
            <div class="profile-info__name">${settings.doctorName || 'Nome do Profissional'}</div>
            <div class="profile-info__crp">${settings.crp || 'CRP não informado'}</div>
            <div class="profile-info__edit" onclick="window.SettingsPage.editProfile()">Editar Perfil</div>
          </div>
        </div>
        
        <div class="settings-section">
          <div class="settings-section__title">Temas & Cores</div>
          <div class="theme-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
            ${THEMES.map(t => `
              <div class="theme-option" onclick="window.SettingsPage.changeTheme('${t.id}')" style="cursor:pointer; text-align:center; padding: 12px 8px; border-radius: var(--r-md); border: 2px solid ${currentTheme === t.id ? 'var(--primary)' : 'var(--border)'}; background: var(--card);">
                <div style="width:24px; height:24px; border-radius:50%; background:${t.color}; margin:0 auto 8px;"></div>
                <div style="font-size:11px; font-weight:600; color:var(--text)">${t.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">WhatsApp Bot</div>
          
          <div class="template-card">
            <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">Mensagem Padrão de Cobrança</div>
            <div class="template-preview" id="template-preview">
              ${formatTemplatePreview(template)}
            </div>
            <button class="btn btn-secondary btn-sm mt-3 w-full" onclick="window.SettingsPage.editTemplate()">Editar Mensagem</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">Dados e Backup</div>
          
          <div class="settings-list">
            <div class="settings-item" onclick="window.SettingsPage.exportData()">
              <div class="settings-item__icon" style="background:var(--primary-subtle); color:var(--primary-light)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label">Exportar Backup</div>
                <div class="settings-item__desc">Salvar dados no aparelho</div>
              </div>
            </div>
            
            <div class="settings-item" onclick="document.getElementById('import-file').click()">
              <div class="settings-item__icon" style="background:var(--warning-bg); color:var(--warning)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label">Importar Backup</div>
                <div class="settings-item__desc">Restaurar dados antigos</div>
              </div>
              <input type="file" id="import-file" class="hidden" accept=".json">
            </div>
            
            <div class="settings-item" onclick="window.SettingsPage.clearData()">
              <div class="settings-item__icon" style="background:var(--danger-bg); color:var(--danger)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label text-danger">Apagar Tudo</div>
                <div class="settings-item__desc">Resetar app (sem volta)</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="version-tag" style="text-align: center; margin-top: 32px; padding-bottom: 16px; color: var(--text-muted); font-size: 12px;">
          PsyAssist v1.0 • PWA Edition<br>
          <span style="display:inline-block; margin-top:6px; padding:4px 12px; background:var(--surface); border-radius:12px; font-weight:600; font-size:11px;">
            Desenvolvido por 🚀 <span style="color:var(--primary)">Skull Studio</span>
          </span>
        </div>
        <input type="file" id="avatar-upload" accept="image/*" class="hidden">
      </div>
    `;
  }

  function formatTemplatePreview(template) {
    return template
      .replace(/{nome}/g, '<span class="template-var">{nome}</span>')
      .replace(/{valor}/g, '<span class="template-var">{valor}</span>');
  }

  function editProfile() {
    const settings = DB.getSettings();
    const name = prompt('Seu Nome:', settings.doctorName || '');
    if (name !== null) {
      const crp = prompt('Seu CRP:', settings.crp || '');
      DB.saveSettings({ doctorName: name, crp: crp || '' });
      Router.navigate('settings', false);
      App.toast('Perfil atualizado', 'success');
    }
  }

  function editTemplate() {
    const current = window.WhatsApp.getTemplate();
    const tpl = prompt('Edite a mensagem (use {nome} e {valor}):', current);
    if (tpl !== null && tpl.trim() !== '') {
      window.WhatsApp.saveTemplate(tpl);
      Router.navigate('settings', false);
      App.toast('Template atualizado', 'success');
    }
  }

  function exportData() {
    const data = {
      patients: localStorage.getItem('psy_patients'),
      payments: localStorage.getItem('psy_payments'),
      cancels: localStorage.getItem('psy_cancels'),
      settings: localStorage.getItem('psy_settings')
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psyassist_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    App.toast('Backup exportado com sucesso!', 'success');
  }

  function clearData() {
    if (confirm('ATENÇÃO: Você perderá TODOS os pacientes, agendas e controle financeiro. Deseja mesmo apagar tudo?')) {
      if (confirm('Tem certeza absoluta? Não é possível reverter sem backup.')) {
        localStorage.clear();
        App.toast('App resetado. Recarregando...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  }

  function onEnter() {
    const fileInput = document.getElementById('import-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.patients) localStorage.setItem('psy_patients', data.patients);
            if (data.payments) localStorage.setItem('psy_payments', data.payments);
            if (data.cancels) localStorage.setItem('psy_cancels', data.cancels);
            if (data.settings) localStorage.setItem('psy_settings', data.settings);
            
            App.toast('Backup importado! Recarregando...', 'success');
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            App.toast('Arquivo de backup inválido', 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    const avatarInput = document.getElementById('avatar-upload');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height, 300);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            const settings = DB.getSettings();
            settings.avatar = base64;
            DB.saveSettings(settings);
            
            Router.navigate('settings', false);
            App.toast('Foto atualizada!', 'success');
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function changeTheme(themeId) {
    const settings = DB.getSettings();
    settings.theme = themeId;
    DB.saveSettings(settings);
    document.documentElement.setAttribute('data-theme', themeId);
    Router.navigate('settings', false);
    App.toast('Tema atualizado!', 'success');
  }

  return { render, onEnter, editProfile, editTemplate, exportData, clearData, changeTheme };
})();

window.SettingsPage = SettingsPage;
