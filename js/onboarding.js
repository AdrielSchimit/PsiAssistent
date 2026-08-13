// PsyAssist — Onboarding, Non-Obstructive Floating Tutorial e PIN Lock

const Onboarding = (() => {

  // ─── PIN LOCK ────────────────────────────────────────────

  function hasPIN() {
    return !!DB.getSettings().pinHash;
  }

  function hashPIN(pin) {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      hash = ((hash << 5) - hash) + pin.charCodeAt(i);
      hash |= 0;
    }
    return 'psy_' + Math.abs(hash).toString(36) + pin.length;
  }

  function setPIN(pin) {
    DB.saveSettings({ pinHash: hashPIN(pin) });
  }

  function checkPIN(pin) {
    return hashPIN(pin) === DB.getSettings().pinHash;
  }

  function removePIN() {
    const s = DB.getSettings();
    delete s.pinHash;
    DB.saveSettings(s);
  }

  function showPINLock(onSuccess) {
    const overlay = document.createElement('div');
    overlay.id = 'pin-lock-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9998;
      background:var(--bg); display:flex; flex-direction:column;
      align-items:center; justify-content:center; padding:32px;
    `;

    overlay.innerHTML = `
      <div style="text-align:center; width:100%; max-width:320px;">
        <div style="font-size:44px; margin-bottom:12px">🔐</div>
        <div style="font-size:22px; font-weight:800; color:var(--text); margin-bottom:4px">PsyAssist</div>
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:32px">Digite seu PIN de 4 dígitos para acessar</div>

        <div id="pin-display" style="display:flex; gap:12px; justify-content:center; margin-bottom:32px">
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; max-width:260px; margin:0 auto;">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
            <button data-key="${k}" style="
              height:60px; border-radius:16px; border:1px solid var(--border);
              background:var(--card); font-size:22px; font-weight:700; color:var(--text);
              cursor:pointer; transition:all 0.15s; ${k==='' ? 'visibility:hidden' : ''}
              box-shadow:0 2px 8px rgba(0,0,0,0.06);
            ">${k}</button>
          `).join('')}
        </div>
        <div id="pin-error" style="color:#F43F5E; font-size:13px; margin-top:16px; min-height:20px; font-weight:600;"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    let entered = '';
    const dots = overlay.querySelectorAll('.pin-dot');

    function updateDots() {
      dots.forEach((d, i) => {
        if (i < entered.length) {
          d.style.background = 'var(--primary)';
          d.style.borderColor = 'var(--primary)';
        } else {
          d.style.background = 'transparent';
          d.style.borderColor = 'var(--border)';
        }
      });
    }

    overlay.querySelectorAll('button[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (key === '⌫') {
          entered = entered.slice(0, -1);
          overlay.querySelector('#pin-error').textContent = '';
          updateDots();
          return;
        }
        if (entered.length >= 4 || key === '') return;
        entered += key;
        updateDots();

        btn.style.background = 'var(--primary-subtle)';
        btn.style.transform = 'scale(0.94)';
        setTimeout(() => { btn.style.background = ''; btn.style.transform = ''; }, 120);

        if (entered.length === 4) {
          setTimeout(() => {
            if (checkPIN(entered)) {
              overlay.style.opacity = '0';
              overlay.style.transition = 'opacity 0.25s';
              setTimeout(() => overlay.remove(), 250);
              onSuccess();
            } else {
              overlay.querySelector('#pin-error').textContent = 'PIN incorreto. Tente novamente.';
              dots.forEach(d => {
                d.style.background = '#F43F5E';
                d.style.borderColor = '#F43F5E';
              });
              setTimeout(() => { entered = ''; updateDots(); }, 650);
            }
          }, 180);
        }
      });
    });
  }

  function showPINSetup(onDone) {
    const overlay = document.createElement('div');
    overlay.id = 'pin-setup-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9997;
      background:rgba(0,0,0,0.55); backdrop-filter:blur(4px);
      display:flex; align-items:flex-end; justify-content:center;
    `;

    overlay.innerHTML = `
      <div style="background:var(--card); border-radius:24px 24px 0 0; padding:28px 24px; width:100%; max-width:440px; text-align:center; box-shadow:0 -10px 40px rgba(0,0,0,0.2); animation:slideUp 0.3s var(--transition-spring);">
        <div style="width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 18px"></div>
        <div style="font-size:32px; margin-bottom:8px">🔐</div>
        <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:4px">Proteger com PIN</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Opcional — garante sigilo aos prontuários dos seus pacientes</div>

        <div id="setup-display" style="display:flex;gap:12px;justify-content:center;margin-bottom:18px">
          ${[0,1,2,3].map(() => `<div class="setup-dot" style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border);background:transparent;transition:all 0.2s"></div>`).join('')}
        </div>

        <div id="setup-step" style="font-size:13px;font-weight:600;color:var(--primary);margin-bottom:16px">Digite uma senha de 4 dígitos</div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:240px;margin:0 auto 16px;">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
            <button data-setup-key="${k}" style="
              height:52px; border-radius:14px; border:1px solid var(--border);
              background:var(--surface); font-size:20px; font-weight:700; color:var(--text);
              cursor:pointer; transition:all 0.15s; ${k==='' ? 'visibility:hidden' : ''}
            ">${k}</button>
          `).join('')}
        </div>

        <button id="skip-pin" style="
          width:100%; background:transparent; border:none; color:var(--text-muted);
          font-size:13px; padding:10px; cursor:pointer; font-weight:600;
        ">Pular por enquanto</button>
      </div>
    `;

    document.body.appendChild(overlay);

    let first = '';
    let second = '';
    let phase = 1;
    const dots = overlay.querySelectorAll('.setup-dot');
    const stepLabel = overlay.querySelector('#setup-step');

    function updateDots(val) {
      dots.forEach((d, i) => {
        if (i < val.length) { d.style.background = 'var(--primary)'; d.style.borderColor = 'var(--primary)'; }
        else { d.style.background = 'transparent'; d.style.borderColor = 'var(--border)'; }
      });
    }

    overlay.querySelectorAll('button[data-setup-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-setup-key');
        if (key === '⌫') {
          if (phase === 1) first = first.slice(0, -1);
          else second = second.slice(0, -1);
          updateDots(phase === 1 ? first : second);
          return;
        }
        if (key === '') return;

        if (phase === 1) {
          if (first.length >= 4) return;
          first += key;
          updateDots(first);
          if (first.length === 4) {
            setTimeout(() => {
              phase = 2;
              second = '';
              stepLabel.textContent = 'Confirme o mesmo PIN';
              updateDots('');
            }, 250);
          }
        } else {
          if (second.length >= 4) return;
          second += key;
          updateDots(second);
          if (second.length === 4) {
            setTimeout(() => {
              if (first === second) {
                setPIN(first);
                overlay.remove();
                App.toast('PIN ativado com sucesso! 🔐', 'success');
                if (onDone) onDone();
              } else {
                stepLabel.textContent = '❌ PINs não coincidem. Tente de novo.';
                dots.forEach(d => { d.style.background = '#F43F5E'; d.style.borderColor = '#F43F5E'; });
                setTimeout(() => { phase = 1; first = ''; second = ''; stepLabel.textContent = 'Digite uma senha de 4 dígitos'; updateDots(''); }, 750);
              }
            }, 200);
          }
        }
      });
    });

    overlay.querySelector('#skip-pin')?.addEventListener('click', () => {
      overlay.remove();
      if (onDone) onDone();
    });
  }

  // ─── COMPACT NON-OBSTRUCTIVE TUTORIAL ────────────────────

  function isTutorialDone() {
    return !!DB.getSettings().tutorialDone;
  }

  const STEPS = [
    {
      icon: '👋',
      title: 'Bem-vinda ao PsyAssist!',
      text: 'Este é um tour rápido. Veja a tela real funcionando enquanto navega.',
      route: 'home',
      action: 'Começar ➜',
    },
    {
      icon: '👥',
      title: 'Aba Pacientes',
      text: 'Veja os pacientes de exemplo abaixo. Toque em qualquer um para abrir prontuário, WhatsApp e recibos.',
      route: 'patients',
      action: 'Próximo ➜',
    },
    {
      icon: '🗓️',
      title: 'Agenda Semanal',
      text: 'Visualize as consultas da semana organizadas por dia e cancele faltas com 1 toque.',
      route: 'schedule',
      action: 'Próximo ➜',
    },
    {
      icon: '💰',
      title: 'Painel Financeiro',
      text: 'Controle quem já pagou o mês e envie lembretes educados de cobrança no WhatsApp.',
      route: 'finance',
      action: 'Próximo ➜',
    },
    {
      icon: '🎤',
      title: 'Cadastro & Voz',
      text: 'Cadastre pacientes novos manualmente ou dite tudo por voz com o microfone inteligente.',
      route: 'book',
      action: 'Próximo ➜',
    },
    {
      icon: '🎉',
      title: 'Tudo Pronto!',
      text: 'Os exemplos serão limpos e o app ficará pronto para os seus pacientes reais.',
      route: 'home',
      action: '🚀 Concluir Tour',
      last: true,
    },
  ];

  function showTutorial(onDone) {
    let step = 0;
    let finished = false;

    let overlay = document.getElementById('tutorial-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tutorial-overlay';
      document.body.appendChild(overlay);
    }

    function renderStep() {
      const s = STEPS[step];
      if (s.route) Router.navigate(s.route, false);

      overlay.style.cssText = `
        position: fixed;
        top: calc(var(--header-height) + var(--safe-top) + 8px);
        left: 12px;
        right: 12px;
        z-index: 8500;
        pointer-events: none;
        display: flex;
        justify-content: center;
        animation: fadeIn 0.25s ease;
      `;

      overlay.innerHTML = `
        <div style="
          background: var(--card);
          border: 1.5px solid var(--primary);
          border-radius: 18px;
          padding: 14px 16px;
          width: 100%;
          max-width: 420px;
          pointer-events: auto;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.22), 0 2px 8px rgba(0,0,0,0.1);
          animation: slideDown 0.3s var(--transition-spring);
        ">
          <!-- Step indicator & Close -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:18px;">${s.icon}</span>
              <strong style="font-size:14px; color:var(--text);">${s.title}</strong>
            </div>
            <span style="font-size:11px; font-weight:700; color:var(--primary); background:var(--primary-subtle); padding:2px 8px; border-radius:10px;">
              ${step + 1} de ${STEPS.length}
            </span>
          </div>

          <!-- Description text -->
          <div style="font-size:12px; color:var(--text-secondary); line-height:1.45; margin-bottom:12px;">
            ${s.text}
          </div>

          <!-- Actions -->
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <button id="tut-skip" style="font-size:11px; color:var(--text-muted); background:none; border:none; cursor:pointer; padding:6px 4px; font-weight:600;">
              Pular tour
            </button>
            <button id="tut-next" style="
              background: var(--primary); color: white; border: none; border-radius: 10px;
              padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer;
              box-shadow: 0 2px 8px var(--primary-glow);
            ">
              ${s.action}
            </button>
          </div>
        </div>
      `;

      overlay.querySelector('#tut-next')?.addEventListener('click', () => {
        if (s.last) {
          finishTutorial();
        } else {
          step++;
          renderStep();
        }
      });

      overlay.querySelector('#tut-skip')?.addEventListener('click', () => {
        finishTutorial();
      });
    }

    function finishTutorial() {
      if (finished) return;
      finished = true;
      overlay.remove();
      DB.clearDemoData();
      DB.saveSettings({ tutorialDone: true });
      Router.navigate('home', false);
      App.toast('Tour finalizado! Bem-vinda ao PsyAssist 🎉', 'success');
      setTimeout(() => showPINSetup(() => {}), 600);
      if (onDone) onDone();
    }

    renderStep();
  }

  // ─── BOOT SEQUENCE ───────────────────────────────────────

  function boot(onReady) {
    function runUnlockedFlow() {
      if (!isTutorialDone()) {
        DB.seedDemoData();
        showTutorial(() => onReady());
      } else {
        onReady();
      }
    }

    function proceed() {
      if (hasPIN()) {
        showPINLock(runUnlockedFlow);
      } else {
        runUnlockedFlow();
      }
    }

    // Step 1: Always check install prompt first on initial load
    if (!InstallManager.isInstalledOrDismissed()) {
      InstallManager.showInstallPrompt(() => {
        proceed();
      });
    } else {
      proceed();
    }
  }

  return { boot, hasPIN, setPIN, checkPIN, removePIN, showPINSetup, showPINLock, showTutorial };
})();

window.Onboarding = Onboarding;
