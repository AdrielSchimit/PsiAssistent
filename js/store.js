// PsyAssist - Minimal global Pub/Sub store

const Store = (() => {
  const bus = new EventTarget();
  let state = { revision: 0, lastChange: null };

  function getState() {
    return { ...state };
  }

  function publish(type, payload = {}) {
    state = { revision: state.revision + 1, lastChange: { type, ...payload } };
    bus.dispatchEvent(new CustomEvent(type, { detail: payload }));
    if (type !== 'db:change') {
      bus.dispatchEvent(new CustomEvent('db:change', { detail: { type, ...payload } }));
    }
  }

  function subscribe(type, listener) {
    const handler = (event) => listener(event.detail, getState());
    bus.addEventListener(type, handler);
    return () => bus.removeEventListener(type, handler);
  }

  return { getState, publish, subscribe };
})();

window.Store = Store;
