// PsyAssist — Router Layer (History API & Back Button)

const Router = (() => {
  const routes = {};
  let currentRoute = null;

  function init() {
    window.addEventListener('popstate', handlePopState);
    
    // Bind all navigation links
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('[data-route]');
      if (navItem) {
        e.preventDefault();
        const route = navItem.getAttribute('data-route');
        navigate(route);
      }
    });
  }

  function register(name, renderFunc, onEnterFunc) {
    routes[name] = { render: renderFunc, onEnter: onEnterFunc };
  }

  function navigate(name, pushState = true) {
    if (!routes[name]) return;
    
    if (pushState && currentRoute !== name) {
      window.history.pushState({ route: name }, '', `#${name}`);
    }

    currentRoute = name;
    
    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-route') === name);
    });

    const contentDiv = document.getElementById('page-content');
    
    // Animate out
    contentDiv.style.opacity = '0.5';
    
    setTimeout(() => {
      contentDiv.innerHTML = routes[name].render();
      contentDiv.scrollTop = 0;
      
      // Execute post-render logic
      if (routes[name].onEnter) {
        routes[name].onEnter();
      }
      
      // Animate in
      contentDiv.classList.remove('page-enter');
      void contentDiv.offsetWidth; // trigger reflow
      contentDiv.classList.add('page-enter');
      contentDiv.style.opacity = '1';
    }, 50);
  }

  function handlePopState(e) {
    if (e.state && e.state.route) {
      navigate(e.state.route, false);
    } else {
      // Default to home if no state
      navigate('home', false);
    }
  }

  return { init, register, navigate };
})();

window.Router = Router;
