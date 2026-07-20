// PsyAssist — Main App Bootstrap

const App = (() => {
  function init() {
    // Apply saved theme
    const settings = DB.getSettings();
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }

    // Init Install Manager (Chunk 1)
    InstallManager.init();

    // Register Routes
    Router.register('home', HomePage.render, HomePage.onEnter);
    Router.register('schedule', SchedulePage.render, SchedulePage.onEnter);
    Router.register('book', BookPage.render, BookPage.onEnter);
    Router.register('patients', PatientsPage.render, PatientsPage.onEnter);
    Router.register('finance', FinancePage.render, FinancePage.onEnter);
    Router.register('settings', SettingsPage.render, SettingsPage.onEnter);

    // Init Router (Chunk 3)
    Router.init();

    // Boot Onboarding (PIN + Tutorial) — then navigate
    Onboarding.boot(() => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['home','schedule','book','patients','finance','settings'].includes(hash)) {
        Router.navigate(hash, false);
      } else {
        Router.navigate('home', false);
      }
    });

    // Register Service Worker for PWA Offline support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
          console.log('SW registered!', reg);
        }).catch(err => console.log('SW registration failed', err));
      });
    }
  }

  // Global Toast Notification System
  function toast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast--${type}`;
    
    const icon = type === 'success' 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    toastEl.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toastEl);

    // Remove after animation (0.3s enter + 2.7s stay + 0.3s leave)
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
    }, 3300);
  }

  return { init, toast };
})();

window.App = App;

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
