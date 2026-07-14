// PsyAssist — Install Prompt (A2HS - Chunk 1)

const InstallManager = (() => {
  let deferredPrompt = null;
  const HAS_INSTALLED_KEY = 'psy_has_installed';

  function init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      
      // Only show if not previously dismissed/installed
      if (localStorage.getItem(HAS_INSTALLED_KEY) !== 'true') {
        showInstallScreen();
      }
    });

    window.addEventListener('appinstalled', (e) => {
      localStorage.setItem(HAS_INSTALLED_KEY, 'true');
      hideInstallScreen();
      App.toast('App instalado com sucesso! 🎉', 'success');
    });
  }

  function showInstallScreen() {
    if (document.getElementById('install-screen')) return;

    const html = `
      <div id="install-screen" class="install-screen">
        <div class="install-screen__content">
          <div class="install-screen__icon-wrap">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21a9 9 0 0 1-9-9c0-5 3.5-9 9-9s9 4 9 9-3.5 9-9 9z"/>
              <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path d="M12 11c3.5 0 6 3 6 7"/>
              <path d="M6 18c0-4 2.5-7 6-7"/>
            </svg>
          </div>
          
          <div class="install-screen__badge">✨ Experiência Premium</div>
          <h2 class="install-screen__title">Instalar <span>PsyAssist</span></h2>
          <p class="install-screen__subtitle">Instale nosso aplicativo nativo para uma experiência mais rápida, offline e segura.</p>
          
          <div class="install-features">
            <div class="install-feature">
              <div class="install-feature__icon">⚡️</div>
              <div class="install-feature__text">
                Rápido e Fluido
                <small>Não depende do navegador</small>
              </div>
            </div>
            <div class="install-feature">
              <div class="install-feature__icon">📶</div>
              <div class="install-feature__text">
                100% Offline
                <small>Seus dados salvos no dispositivo</small>
              </div>
            </div>
            <div class="install-feature">
              <div class="install-feature__icon">📸</div>
              <div class="install-feature__text">
                Acesso à Câmera
                <small>Para leitura inteligente de caderninho</small>
              </div>
            </div>
          </div>
          
          <div class="install-screen__actions">
            <button id="btn-install-app" class="btn btn-primary btn-full">📲 Instalar Aplicativo</button>
            <button id="btn-dismiss-install" class="btn btn-ghost btn-full">Agora não, continuar na web</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('btn-install-app').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          localStorage.setItem(HAS_INSTALLED_KEY, 'true');
          hideInstallScreen();
        }
        deferredPrompt = null;
      } else {
        // Fallback instructions if prompt is null
        alert('Para instalar, toque em "Compartilhar" (iOS) ou nos três pontos (Android) e depois em "Adicionar à Tela de Início".');
      }
    });

    document.getElementById('btn-dismiss-install').addEventListener('click', () => {
      localStorage.setItem(HAS_INSTALLED_KEY, 'true'); // don't bother again this session
      hideInstallScreen();
    });
  }

  function hideInstallScreen() {
    const el = document.getElementById('install-screen');
    if (el) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      setTimeout(() => el.remove(), 300);
    }
  }

  return { init, showInstallScreen };
})();

window.InstallManager = InstallManager;
