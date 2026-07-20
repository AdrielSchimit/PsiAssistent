// PsyAssist — Onboarding, Tutorial e PIN Lock

const Onboarding = (() => {

  // ─── PIN LOCK ────────────────────────────────────────────

  function hasPIN() {
    return !!DB.getSettings().pinHash;
  }

  function hashPIN(pin) {
    // Simple hash (not cryptographic, just obfuscation for localStorage)
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
        <div style="font-size:48px; margin-bottom:16px">🔐</div>
        <div style="font-size:22px; font-weight:800; color:var(--text); margin-bottom:6px">PsyAssist</div>
        <div style="font-size:14px; color:var(--text-muted); margin-bottom:40px">Digite o seu PIN para continuar</div>

        <div id="pin-display" style="display:flex; gap:12px; justify-content:center; margin-bottom:32px">
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
          <div class="pin-dot" style="width:14px; height:14px; border-radius:50%; border:2px solid var(--border); background:transparent; transition:all 0.2s"></div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; max-width:260px; margin:0 auto;">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
            <button data-key="${k}" style="
              height:64px; border-radius:16px; border:1px solid var(--border);
              background:var(--card); font-size:22px; font-weight:600; color:var(--text);
              cursor:pointer; transition:all 0.15s; ${k==='' ? 'visibility:hidden' : ''}
              box-shadow:0 2px 8px rgba(0,0,0,0.06);
            ">${k}</button>
          `).join('')}
        </div>
        <div id="pin-error" style="color:#F43F5E; font-size:13px; margin-top:16px; min-height:20px;"></div>
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

        // Add press effect
        btn.style.background = 'var(--primary-subtle)';
        btn.style.transform = 'scale(0.93)';
        setTimeout(() => { btn.style.background = ''; btn.style.transform = ''; }, 120);

        if (entered.length === 4) {
          setTimeout(() => {
            if (checkPIN(entered)) {
              overlay.style.opacity = '0';
              overlay.style.transition = 'opacity 0.3s';
              setTimeout(() => overlay.remove(), 300);
              onSuccess();
            } else {
              overlay.querySelector('#pin-error').textContent = 'PIN incorreto. Tente novamente.';
              dots.forEach(d => {
                d.style.background = '#F43F5E';
                d.style.borderColor = '#F43F5E';
              });
              setTimeout(() => { entered = ''; updateDots(); }, 700);
            }
          }, 200);
        }
      });
    });
  }

  function showPINSetup(onDone) {
    const overlay = document.createElement('div');
    overlay.id = 'pin-setup-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9997;
      background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);
      display:flex; align-items:flex-end; justify-content:center;
    `;

    overlay.innerHTML = `
      <div style="background:var(--card); border-radius:24px 24px 0 0; padding:32px; width:100%; max-width:480px; text-align:center;">
        <div style="width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 24px"></div>
        <div style="font-size:32px; margin-bottom:12px">🔐</div>
        <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px">Criar PIN de Segurança</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:28px">Opcional — protege seu app de olhares curiosos</div>

        <div id="setup-display" style="display:flex;gap:12px;justify-content:center;margin-bottom:24px">
          ${[0,1,2,3].map(() => `<div class="setup-dot" style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border);background:transparent;transition:all 0.2s"></div>`).join('')}
        </div>

        <div id="setup-step" style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Digite um PIN de 4 dígitos</div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:240px;margin:0 auto 16px;">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
            <button data-setup-key="${k}" style="
              height:56px; border-radius:14px; border:1px solid var(--border);
              background:var(--surface); font-size:20px; font-weight:600; color:var(--text);
              cursor:pointer; transition:all 0.15s; ${k==='' ? 'visibility:hidden' : ''}
            ">${k}</button>
          `).join('')}
        </div>

        <button id="skip-pin" style="
          width:100%; background:transparent; border:none; color:var(--text-muted);
          font-size:13px; padding:12px; cursor:pointer; margin-top:4px;
        ">Pular — não quero PIN agora</button>
      </div>
    `;

    document.body.appendChild(overlay);

    let first = '';
    let second = '';
    let phase = 1; // 1=enter, 2=confirm
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
              stepLabel.textContent = 'Confirme o PIN';
              updateDots('');
            }, 300);
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
                App.toast('PIN criado com sucesso! 🔐', 'success');
                onDone();
              } else {
                stepLabel.textContent = '❌ PINs diferentes. Tente de novo.';
                dots.forEach(d => { d.style.background = '#F43F5E'; d.style.borderColor = '#F43F5E'; });
                setTimeout(() => { phase = 1; first = ''; second = ''; stepLabel.textContent = 'Digite um PIN de 4 dígitos'; updateDots(''); }, 800);
              }
            }, 200);
          }
        }
      });
    });

    overlay.querySelector('#skip-pin').addEventListener('click', () => {
      overlay.remove();
      onDone();
    });
  }

  // ─── TUTORIAL ────────────────────────────────────────────

  function isTutorialDone() {
    return !!DB.getSettings().tutorialDone;
  }

  function clearDemoData() {
    // Remove only the demo patients by name
    const DEMO_NAMES = ['Ana Paula Souza', 'Carlos Eduardo', 'Mariana Costa'];
    const patients = DB.getPatients();
    const demoIds = patients.filter(p => DEMO_NAMES.includes(p.name)).map(p => p.id);
    demoIds.forEach(id => {
      const all = DB.getPatients().filter(p => p.id !== id);
      localStorage.setItem('psy_patients', JSON.stringify(all));
    });
    // Also remove their payments
    const allPayments = JSON.parse(localStorage.getItem('psy_payments') || '[]');
    const cleaned = allPayments.filter(pay => !demoIds.includes(pay.patientId));
    localStorage.setItem('psy_payments', JSON.stringify(cleaned));
  }

  const STEPS = [
    {
      icon: '👋',
      title: 'Bem-vindo ao PsyAssist!',
      text: 'Seu assistente inteligente para psicólogos. Vamos fazer um tour rápido pelas funcionalidades principais.',
      highlight: null,
      action: 'Vamos lá!',
    },
    {
      icon: '👥',
      title: 'Seus Pacientes',
      text: 'Cadastramos 3 pacientes de exemplo para você explorar. Toque em qualquer um para ver o perfil completo, enviar mensagens no WhatsApp e muito mais!',
      highlight: null,
      action: 'Entendi!',
      route: 'patients',
    },
    {
      icon: '🗓️',
      title: 'Agenda Semanal',
      text: 'Na aba Agenda você vê todas as sessões da semana. Deslize os dias e marque presenças ou faltas com um toque.',
      highlight: null,
      action: 'Próximo',
      route: 'schedule',
    },
    {
      icon: '💰',
      title: 'Controle Financeiro',
      text: 'O Painel Financeiro mostra quem pagou e quem está devendo no mês. Toque no status para marcar como pago, ou no WhatsApp para cobrar diretamente!',
      highlight: null,
      action: 'Próximo',
      route: 'finance',
    },
    {
      icon: '🎤',
      title: 'Cadastro por Voz!',
      text: 'Na aba Agendar, você pode ditar os dados do paciente por voz ou tirar uma foto do caderninho. O app preenche o formulário automaticamente!',
      highlight: null,
      action: 'Próximo',
      route: 'book',
    },
    {
      icon: '🎉',
      title: 'Tudo Pronto!',
      text: 'Agora os pacientes de exemplo serão removidos e o seu app começa limpo, do zero, só com os seus dados reais.',
      highlight: null,
      action: '🚀 Começar a Usar!',
      last: true,
    },
  ];

  function showTutorial(onDone) {
    let step = 0;

    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';

    function renderStep() {
      const s = STEPS[step];
      if (s.route) Router.navigate(s.route, false);

      overlay.style.cssText = `
        position:fixed; inset:0; z-index:9995;
        background:rgba(0,0,0,0.6); backdrop-filter:blur(3px);
        display:flex; align-items:flex-end; justify-content:center;
        animation: fadeIn 0.3s ease;
      `;

      overlay.innerHTML = `
        <div style="
          background:var(--card); border-radius:28px 28px 0 0;
          width:100%; max-width:480px; padding:32px 24px;
          animation: slideUp 0.4s var(--transition-spring);
        ">
          <div style="width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 24px"></div>

          <!-- Progress dots -->
          <div style="display:flex;gap:6px;justify-content:center;margin-bottom:24px">
            ${STEPS.map((_, i) => `
              <div style="width:${i===step?20:8}px;height:8px;border-radius:4px;
                background:${i===step ? 'var(--primary)' : 'var(--border)'};
                transition:all 0.3s"></div>
            `).join('')}
          </div>

          <div style="text-align:center;padding:0 8px">
            <div style="font-size:52px;margin-bottom:16px;line-height:1">${s.icon}</div>
            <div style="font-size:20px;font-weight:800;color:var(--text);margin-bottom:12px">${s.title}</div>
            <div style="font-size:14px;color:var(--text-muted);line-height:1.6;margin-bottom:28px">${s.text}</div>
          </div>

          <button id="tut-next" style="
            width:100%; background:linear-gradient(135deg,var(--primary),var(--primary-light));
            color:white; border:none; border-radius:var(--r-md); padding:16px;
            font-size:15px; font-weight:700; cursor:pointer;
            box-shadow:0 4px 12px var(--primary-glow);
          ">${s.action}</button>

          ${step > 0 ? `<button id="tut-skip" style="
            width:100%; background:transparent; border:none; color:var(--text-muted);
            font-size:13px; padding:12px; cursor:pointer; margin-top:4px;
          ">Pular tutorial</button>` : `<div style="height:16px"></div>`}
        </div>
      `;

      overlay.querySelector('#tut-next').addEventListener('click', () => {
        if (s.last) {
          finishTutorial();
        } else {
          step++;
          renderStep();
        }
      });

      const skipBtn = overlay.querySelector('#tut-skip');
      if (skipBtn) {
        skipBtn.addEventListener('click', () => finishTutorial());
      }
    }

    function finishTutorial() {
      overlay.remove();
      // Clear demo data
      clearDemoData();
      // Mark done
      DB.saveSettings({ tutorialDone: true });
      // Navigate home fresh
      Router.navigate('home', false);
      App.toast('App pronto! Bem-vindo ao PsyAssist 🎉', 'success');
      // After tutorial, offer PIN setup
      setTimeout(() => showPINSetup(() => {}), 800);
      onDone();
    }

    document.body.appendChild(overlay);
    renderStep();
  }

  // ─── BOOT ────────────────────────────────────────────────

  function boot(onReady) {
    // 1. If PIN is set, show lock first
    if (hasPIN()) {
      showPINLock(() => {
        // 2. After unlock: check tutorial
        if (!isTutorialDone()) {
          DB.seedDemoData();
          showTutorial(() => onReady());
        } else {
          onReady();
        }
      });
    } else {
      // No PIN: check tutorial
      if (!isTutorialDone()) {
        DB.seedDemoData();
        showTutorial(() => onReady());
      } else {
        onReady();
      }
    }
  }

  return { boot, hasPIN, setPIN, checkPIN, removePIN, showPINSetup, showPINLock };
})();

window.Onboarding = Onboarding;
