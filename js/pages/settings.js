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
    const currentTheme = settings.theme || 'indigo';
    const docName = settings.doctorName || 'Nome do Profissional';
    const crp = settings.crp || 'CRP não informado';
    
    return `
      <div class="page-container" style="padding-bottom:120px;">
        <div class="page-header">
          <h1 class="page-header__title">Ajustes & <span>Perfil</span></h1>
          <p style="font-size:13px; color:var(--text-muted); margin-top:2px;">Personalize seu app, segurança e dados profissionais.</p>
        </div>
        
        <div class="profile-card" style="box-shadow:var(--shadow-sm); border:1px solid var(--border);">
          <div class="profile-avatar" style="cursor:pointer; overflow:hidden; position:relative; ${settings.avatar ? 'background:transparent' : ''}" onclick="document.getElementById('avatar-upload').click()" title="Toque para alterar a foto">
            ${settings.avatar ? `<img src="${settings.avatar}" style="width:100%; height:100%; object-fit:cover">` : ((docName.replace(/[^a-zA-Z]/g,'').slice(0,2).toUpperCase()) || 'DR')}
            <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.5); font-size:10px; height:18px; display:flex; align-items:center; justify-content:center; color:white">📷</div>
          </div>
          <div class="profile-info">
            <div class="profile-info__name" style="font-size:18px; font-weight:800;">${docName}</div>
            <div class="profile-info__crp" style="font-size:13px; color:var(--text-muted);">${crp}</div>
            <div class="profile-info__edit" onclick="window.SettingsPage.editProfile()" style="font-size:12px; font-weight:700; color:var(--primary); cursor:pointer; margin-top:4px;">✏️ Editar Dados Profissionais</div>
          </div>
        </div>
        
        <div class="settings-section">
          <div class="settings-section__title">Temas & Cores</div>
          <div class="theme-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
            ${THEMES.map(t => `
              <div class="theme-option" onclick="window.SettingsPage.changeTheme('${t.id}')" style="cursor:pointer; text-align:center; padding: 12px 8px; border-radius: var(--r-md); border: 2px solid ${currentTheme === t.id ? 'var(--primary)' : 'var(--border)'}; background: var(--card); transition:transform 0.15s ease;">
                <div style="width:26px; height:26px; border-radius:50%; background:${t.color}; margin:0 auto 8px; box-shadow:0 2px 8px ${t.color}44;"></div>
                <div style="font-size:11px; font-weight:700; color:var(--text)">${t.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">Mensagens Rápidas (WhatsApp)</div>
          
          <div class="template-card" style="box-shadow:var(--shadow-sm); border:1px solid var(--border);">
            <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">Modelos de mensagens enviados com 1 clique aos pacientes:</div>
            ${Object.entries(window.WhatsApp.getTemplateLabels()).map(([key, label]) => {
              const tpls = window.WhatsApp.getTemplates();
              const text = tpls[key] || '';
              return `
              <div style="margin-bottom:14px; background:var(--surface); border-radius:var(--r-md); padding:12px; border:1px solid var(--border);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <strong style="font-size:12px; color:var(--text);">${label}</strong>
                  <button class="btn btn-secondary btn-sm" onclick="window.SettingsPage.editTemplateByKey('${key}')" style="font-size:11px; padding:4px 10px;">Editar</button>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${text.replace(/{nome}/g,'<span style="background:var(--primary-subtle);color:var(--primary);padding:1px 5px;border-radius:4px;font-weight:700">{nome}</span>').replace(/{valor}/g,'<span style="background:var(--primary-subtle);color:var(--primary);padding:1px 5px;border-radius:4px;font-weight:700">{valor}</span>')}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">Segurança & Guia</div>
          <div class="settings-list" style="box-shadow:var(--shadow-sm); border:1px solid var(--border); border-radius:var(--r-md); overflow:hidden;">
            <div class="settings-item" onclick="window.SettingsPage.managePIN()" style="cursor:pointer;">
              <div class="settings-item__icon" style="background:rgba(79,70,229,0.1); color:var(--primary)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label" id="pin-status-label">${window.Onboarding?.hasPIN() ? '🔐 PIN Ativo — Alterar / Remover' : '🔓 Criar PIN de Segurança'}</div>
                <div class="settings-item__desc">${window.Onboarding?.hasPIN() ? 'Protege o app e prontuários com 4 dígitos' : 'Opcional — impede acesso não autorizado'}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            <div class="settings-item" onclick="window.SettingsPage.replayTutorial()" style="cursor:pointer; border-top:1px solid var(--border);">
              <div class="settings-item__icon" style="background:rgba(16,185,129,0.1); color:var(--success)">
                <span style="font-size:18px;">🎓</span>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label">Rever Tour / Tutorial</div>
                <div class="settings-item__desc">Explicação passo a passo de como usar o app</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            <div class="settings-item" onclick="window.SettingsPage.installApp()" style="cursor:pointer; border-top:1px solid var(--border);">
              <div class="settings-item__icon" style="background:rgba(249,115,22,0.12); color:var(--primary)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"></path><polyline points="7 10 12 15 17 10"></polyline><rect x="5" y="19" width="14" height="2" rx="1"></rect></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label">Instalar Aplicativo</div>
                <div class="settings-item__desc">Adicionar o PsyAssist na tela inicial do celular</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">Dados, Relatórios e Backup</div>
          
          <div class="settings-list" style="box-shadow:var(--shadow-sm); border:1px solid var(--border); border-radius:var(--r-md); overflow:hidden;">
            <div class="settings-item" onclick="window.SettingsPage.exportPDF()" style="cursor:pointer;">
              <div class="settings-item__icon" style="background:rgba(79,70,229,0.1); color:var(--primary)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label">Exportar Relatório Mensal (PDF)</div>
                <div class="settings-item__desc">Demonstrativo financeiro completo para impressão</div>
              </div>
            </div>

            <div class="settings-item" onclick="window.SettingsPage.exportData()" style="cursor:pointer; border-top:1px solid var(--border);">
              <div class="settings-item__icon" style="background:var(--primary-subtle); color:var(--primary-light)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label">Exportar Backup Completo (.JSON)</div>
                <div class="settings-item__desc">Salva pacientes, prontuários e financeiro em segurança</div>
              </div>
            </div>
            
            <div class="settings-item" onclick="document.getElementById('import-file').click()" style="cursor:pointer; border-top:1px solid var(--border);">
              <div class="settings-item__icon" style="background:var(--warning-bg); color:var(--warning)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label">Importar / Restaurar Backup</div>
                <div class="settings-item__desc">Recuperar dados salvos anteriormente</div>
              </div>
              <input type="file" id="import-file" class="hidden" accept=".json">
            </div>

            <div class="settings-item" onclick="window.SettingsPage.clearData()" style="cursor:pointer; border-top:1px solid var(--border);">
              <div class="settings-item__icon" style="background:var(--danger-bg); color:var(--danger)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </div>
              <div class="settings-item__content">
                <div class="settings-item__label text-danger">Resetar Dados do App</div>
                <div class="settings-item__desc">Apagar todos os registros (recomeçar do zero)</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="version-tag" style="text-align: center; margin-top: 32px; padding-bottom: 16px; color: var(--text-muted); font-size: 12px;">
          PsyAssist v2.0 • Edição Clínica<br>
          <span style="display:inline-block; margin-top:6px; padding:4px 12px; background:var(--surface); border-radius:12px; font-weight:600; font-size:11px;">
            Desenvolvido com carinho para Psicólogos 💜
          </span>
          <br>
          <a href="https://skull-studio.vercel.app/" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:8px; color:var(--primary); font-weight:800; text-decoration:none;">
            by "skull studio"
          </a>
        </div>
        <input type="file" id="avatar-upload" accept="image/*" class="hidden">
      </div>
    `;
  }

  function editProfile() {
    const settings = DB.getSettings();
    const name = prompt('Nome do(a) Psicólogo(a):', settings.doctorName || '');
    if (name !== null) {
      const crp = prompt('Número do CRP (Ex: 06/123456):', settings.crp || '');
      DB.saveSettings({ doctorName: name.trim(), crp: (crp || '').trim() });
      Router.navigate('settings', false);
      App.toast('Dados do profissional atualizados!', 'success');
    }
  }

  function replayTutorial() {
    DB.saveSettings({ tutorialDone: false });
    window.location.reload();
  }

  function installApp() {
    if (!window.InstallManager?.requestInstallFromSettings) {
      App.toast('Instalação indisponível neste navegador.', 'error');
      return;
    }
    window.InstallManager.requestInstallFromSettings();
  }

  function exportData() {
    const data = DB.exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psyassist_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    App.toast('Backup exportado com sucesso! Salve em local seguro.', 'success');
  }

  function clearData() {
    if (confirm('ATENÇÃO: Você perderá TODOS os pacientes, prontuários, agendas e controle financeiro. Deseja mesmo apagar tudo?')) {
      if (confirm('Tem certeza absoluta? Essa ação não pode ser desfeita.')) {
        DB.resetAll({ keepInstallFlag: false });
        App.toast('App resetado. Recarregando...', 'success');
        setTimeout(() => window.location.reload(), 1200);
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
            DB.importBackup(data);
            App.toast('Backup importado com sucesso! Recarregando...', 'success');
            setTimeout(() => window.location.reload(), 1200);
          } catch (err) {
            App.toast('Arquivo de backup inválido.', 'error');
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
            
            const base64 = canvas.toDataURL('image/jpeg', 0.85);
            const settings = DB.getSettings();
            settings.avatar = base64;
            DB.saveSettings(settings);
            
            Router.navigate('settings', false);
            App.toast('Foto de perfil atualizada!', 'success');
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

  function editTemplateByKey(key) {
    const tpls = window.WhatsApp.getTemplates();
    const labels = window.WhatsApp.getTemplateLabels();
    const current = tpls[key] || '';
    const newText = prompt(`Editar: ${labels[key]}\n\nVariáveis disponíveis:\n{nome} = Primeiro nome do paciente\n{valor} = Valor da sessão`, current);
    if (newText !== null && newText.trim()) {
      window.WhatsApp.saveTemplateByKey(key, newText.trim());
      Router.navigate('settings', false);
      App.toast('Mensagem do WhatsApp atualizada!', 'success');
    }
  }

  function exportPDF() {
    const settings = DB.getSettings();
    const month = DB.getCurrentMonth();
    DB.ensureMonthPayments(month);
    const summary = DB.getMonthSummary(month);
    const payments = DB.getPaymentsByMonth(month);
    const patients = DB.getPatients();
    const docName = settings.doctorName || 'Profissional';
    const crp = settings.crp ? `CRP: ${settings.crp}` : '';

    const rows = payments.map(pay => {
      const p = patients.find(pat => pat.id === pay.patientId);
      if (!p || !p.active) return '';
      return `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:10px 14px; font-weight:600;">${p.name}</td>
        <td style="padding:10px 14px;">${DB.getDayOfWeekName(p.dayOfWeek)} às ${p.time}</td>
        <td style="padding:10px 14px;">${p.modality === 'online' ? 'Online' : 'Presencial'}</td>
        <td style="padding:10px 14px; font-weight:700;">R$ ${pay.value.toFixed(2).replace('.',',')}</td>
        <td style="padding:10px 14px; color:${pay.paid ? '#10B981' : '#F43F5E'}; font-weight:700">${pay.paid ? '✅ Pago' : '⏳ Pendente'}</td>
      </tr>`;
    }).join('');

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Financeiro - ${DB.formatMonth(month)}</title>
      <style>
        body { font-family: 'Inter', sans-serif, Arial; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 24px; }
        .title { font-size: 24px; font-weight: 800; color: #4F46E5; margin: 0; }
        .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
        .summary-boxes { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
        .s-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
        .s-box-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px; }
        .s-box-val { font-size: 20px; font-weight: 800; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
        th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #475569; }
        .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        @media print { .no-print { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">Demonstrativo Financeiro</h1>
          <div class="subtitle">${docName} ${crp ? `· ${crp}` : ''} • ${DB.formatMonth(month)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: 800; color: #10B981;">R$ ${summary.received.toFixed(2).replace('.',',')}</div>
          <div style="font-size: 12px; color: #64748b;">Total Recebido no Mês</div>
        </div>
      </div>

      <div class="summary-boxes">
        <div class="s-box">
          <div class="s-box-label">Recebido</div>
          <div class="s-box-val" style="color: #10B981;">R$ ${summary.received.toFixed(2).replace('.',',')}</div>
        </div>
        <div class="s-box">
          <div class="s-box-label">Pendente</div>
          <div class="s-box-val" style="color: #F43F5E;">R$ ${summary.pending.toFixed(2).replace('.',',')}</div>
        </div>
        <div class="s-box">
          <div class="s-box-label">Previsto Total</div>
          <div class="s-box-val" style="color: #4F46E5;">R$ ${summary.total.toFixed(2).replace('.',',')}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Atendimento</th>
            <th>Modalidade</th>
            <th>Honorários</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5" style="padding:24px; text-align:center; color:#94a3b8;">Nenhum atendimento neste mês.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} • PsyAssist
      </div>

      <div class="no-print" style="margin-top: 24px; text-align: center;">
        <button onclick="window.print()" style="background: #4F46E5; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>
    </body>
    </html>`);
    w.document.close();
  }

  function managePIN() {
    if (window.Onboarding.hasPIN()) {
      const choice = confirm('PIN ativo!\n\nOK = Alterar PIN\nCancelar = Remover PIN');
      if (choice) {
        window.Onboarding.showPINSetup(() => Router.navigate('settings', false));
      } else {
        if (confirm('Tem certeza que deseja remover a senha PIN?')) {
          window.Onboarding.removePIN();
          App.toast('PIN de segurança removido.', 'success');
          Router.navigate('settings', false);
        }
      }
    } else {
      window.Onboarding.showPINSetup(() => Router.navigate('settings', false));
    }
  }

  return {
    render, onEnter, editProfile, editTemplateByKey,
    exportData, exportPDF, clearData, changeTheme, managePIN, replayTutorial, installApp
  };
})();

window.SettingsPage = SettingsPage;
