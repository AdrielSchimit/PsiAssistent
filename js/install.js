// PsyAssist — Install Prompt (PWA Install Banner / Modal)

const InstallManager = (() => {
  let deferredPrompt = null;
  const HAS_INSTALLED_KEY = 'psy_has_installed';

  function init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      localStorage.setItem(HAS_INSTALLED_KEY, 'true');
      hideInstallScreen();
      App.toast('App instalado com sucesso! 🎉', 'success');
    });
  }

  function isInstalledOrDismissed() {
    // Check if running in standalone mode (already installed and opened as app)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      localStorage.setItem(HAS_INSTALLED_KEY, 'true');
      return true;
    }
    return localStorage.getItem(HAS_INSTALLED_KEY) === 'true';
  }

  function showInstallPrompt(onDone) {
    if (isInstalledOrDismissed()) {
      if (onDone) onDone();
      return;
    }

    if (document.getElementById('install-screen')) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const html = `
      <div id="install-screen" class="install-screen" style="position:fixed; inset:0; z-index:9999; background:rgba(13,12,29,0.7); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.3s ease;">
        <div class="install-screen__content" style="background:var(--card); border:1px solid var(--border); border-radius:24px; padding:28px 22px; width:100%; max-width:380px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.3); animation:slideUp 0.35s var(--transition-spring);">
          
          <div style="width:68px; height:68px; margin:0 auto 16px; background:linear-gradient(135deg, var(--primary), #8B5CF6); border-radius:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px var(--primary-glow);">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21a9 9 0 0 1-9-9c0-5 3.5-9 9-9s9 4 9 9-3.5 9-9 9z"/>
              <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path d="M12 11c3.5 0 6 3 6 7"/>
              <path d="M6 18c0-4 2.5-7 6-7"/>
            </svg>
          </div>
          
          <div style="display:inline-block; background:var(--primary-subtle); color:var(--primary); font-size:11px; font-weight:700; padding:4px 12px; border-radius:12px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px;">
            ✨ Experiência de App
          </div>

          <h2 style="font-size:22px; font-weight:800; color:var(--text); margin-bottom:8px; letter-spacing:-0.5px;">
            Deseja instalar o <span style="color:var(--primary)">PsyAssist</span>?
          </h2>
          <p style="color:var(--text-muted); font-size:13px; line-height:1.5; margin-bottom:20px;">
            Instale o app na sua tela de início para acesso rápido, seguro e sem barras de navegador.
          </p>

          <div style="background:var(--surface); border-radius:16px; padding:14px; text-align:left; margin-bottom:20px; border:1px solid var(--border); display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px; font-size:12px; font-weight:600; color:var(--text);">
              <span>⚡</span> Acesso instantâneo com 1 toque
            </div>
            <div style="display:flex; align-items:center; gap:10px; font-size:12px; font-weight:600; color:var(--text);">
              <span>🔒</span> Prontuários protegidos no aparelho
            </div>
            <div style="display:flex; align-items:center; gap:10px; font-size:12px; font-weight:600; color:var(--text);">
              <span>📶</span> Funciona normalmente sem internet
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            <button id="btn-install-app" class="btn btn-primary btn-full" style="padding:14px; font-size:14px; font-weight:700;">
              📲 Instalar Aplicativo
            </button>
            <button id="btn-dismiss-install" class="btn btn-ghost btn-full" style="padding:10px; font-size:13px; color:var(--text-muted); border:none; background:none; cursor:pointer;">
              Agora não, continuar no navegador
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const finish = () => {
      localStorage.setItem(HAS_INSTALLED_KEY, 'true');
      hideInstallScreen();
      if (onDone) setTimeout(onDone, 300);
    };

    document.getElementById('btn-install-app')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          finish();
        }
        deferredPrompt = null;
      } else {
        if (isIOS) {
          alert('📱 Para instalar no iPhone:\n\n1. Toque no botão Compartilhar (quadrado com seta ⬆️ no rodapé do Safari)\n2. Role para baixo e selecione "Adicionar à Tela de Início (+)"\n3. Toque em "Adicionar"');
        } else {
          alert('📱 Para instalar no Android:\n\nToque nos 3 pontinhos do Chrome (topo direito) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
        }
        finish();
      }
    });

    document.getElementById('btn-dismiss-install')?.addEventListener('click', () => {
      finish();
    });
  }

  function hideInstallScreen() {
    const el = document.getElementById('install-screen');
    if (el) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease';
      setTimeout(() => el.remove(), 250);
    }
  }

  return { init, showInstallPrompt, isInstalledOrDismissed };
})();

window.InstallManager = InstallManager;
