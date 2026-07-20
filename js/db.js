// PsyAssist — Database Layer (localStorage)

const DB = (() => {
  const KEYS = {
    PATIENTS: 'psy_patients',
    PAYMENTS: 'psy_payments',
    CANCELS: 'psy_cancels',
    SETTINGS: 'psy_settings',
  };

  const STORAGE_PREFIX = 'psy:b64:v1:';
  const DEMO_PATIENTS = [
    { name: 'Ana Paula Souza', phone: '5511991234567', valuePerSession: 200, dayOfWeek: 1, time: '09:00', notes: 'Ansiedade generalizada' },
    { name: 'Carlos Eduardo', phone: '5511998765432', valuePerSession: 180, dayOfWeek: 3, time: '14:30', notes: 'Depressao leve' },
    { name: 'Mariana Costa', phone: '5511987654321', valuePerSession: 220, dayOfWeek: 5, time: '10:00', notes: '' },
  ];
  const KEY_EVENTS = {
    [KEYS.PATIENTS]: 'db:patients',
    [KEYS.PAYMENTS]: 'db:payments',
    [KEYS.CANCELS]: 'db:cancels',
    [KEYS.SETTINGS]: 'db:settings',
  };

  // ─── Helpers ────────────────────────────────────────────
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Obfuscation only: Base64 is reversible and is not encryption.
  function encode(data) {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return STORAGE_PREFIX + btoa(binary);
  }

  function decode(raw, fallback) {
    if (!raw) return fallback;
    try {
      if (!raw.startsWith(STORAGE_PREFIX)) return JSON.parse(raw); // Legacy JSON
      const binary = atob(raw.slice(STORAGE_PREFIX.length));
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return fallback;
    }
  }

  function getStored(key, fallback) {
    return decode(localStorage.getItem(key), fallback);
  }

  function setStored(key, data) {
    localStorage.setItem(key, encode(data));
    window.Store?.publish(KEY_EVENTS[key] || 'db:storage', { key });
  }

  function getAll(key) {
    const data = getStored(key, []);
    return Array.isArray(data) ? data : [];
  }

  function setAll(key, data) {
    setStored(key, data);
  }

  // ─── PATIENTS ────────────────────────────────────────────
  /**
   * Patient schema:
   * { id, name, phone, valuePerSession, dayOfWeek (0-6), time ("HH:MM"),
   *   active, notes, avatarColor, createdAt }
   */
  const AVATAR_COLORS = [
    '#7C5CFC','#A855F7','#EC4899','#F97316','#14B8A6',
    '#3B82F6','#10B981','#EAB308','#EF4444','#8B5CF6'
  ];

  function getPatients() {
    return getAll(KEYS.PATIENTS);
  }

  function getPatient(id) {
    return getPatients().find(p => p.id === id) || null;
  }

  function savePatient(data) {
    const patients = getPatients();
    const existing = patients.findIndex(p => p.id === data.id);
    if (existing >= 0) {
      patients[existing] = { ...patients[existing], ...data, updatedAt: Date.now() };
    } else {
      const colorIndex = patients.length % AVATAR_COLORS.length;
      patients.push({
        id: uid(),
        avatarColor: AVATAR_COLORS[colorIndex],
        active: true,
        notes: '',
        createdAt: Date.now(),
        ...data,
      });
    }
    setAll(KEYS.PATIENTS, patients);
    return patients.find(p => p.name === data.name && p.createdAt) || patients[patients.length - 1];
  }

  function deletePatient(id) {
    const patients = getPatients().filter(p => p.id !== id);
    setAll(KEYS.PATIENTS, patients);
    // Also clean up payments and cancels for this patient
    setAll(KEYS.PAYMENTS, getPayments().filter(p => p.patientId !== id));
    setAll(KEYS.CANCELS, getCancels().filter(c => c.patientId !== id));
  }

  function getActivePatients() {
    return getPatients().filter(p => p.active);
  }

  // ─── PAYMENTS ────────────────────────────────────────────
  /**
   * Payment schema:
   * { id, patientId, month ("YYYY-MM"), paid, paidAt, value, sessionCount }
   */
  function getPayments() {
    return getAll(KEYS.PAYMENTS);
  }

  function getPaymentsByMonth(month) {
    return getPayments().filter(p => p.month === month);
  }

  function getPaymentForPatient(patientId, month) {
    return getPayments().find(p => p.patientId === patientId && p.month === month) || null;
  }

  function ensureMonthPayments(month) {
    // Creates payment records for all active patients for a given month if they don't exist
    const patients = getActivePatients();
    const payments = getPayments();
    let changed = false;
    patients.forEach(patient => {
      const exists = payments.find(p => p.patientId === patient.id && p.month === month);
      if (!exists) {
        payments.push({
          id: uid(),
          patientId: patient.id,
          month,
          paid: false,
          paidAt: null,
          value: patient.valuePerSession || 0,
          sessionCount: 1,
        });
        changed = true;
      }
    });
    if (changed) setAll(KEYS.PAYMENTS, payments);
  }

  function togglePayment(patientId, month) {
    const payments = getPayments();
    const idx = payments.findIndex(p => p.patientId === patientId && p.month === month);
    if (idx >= 0) {
      payments[idx].paid = !payments[idx].paid;
      payments[idx].paidAt = payments[idx].paid ? Date.now() : null;
      setAll(KEYS.PAYMENTS, payments);
      return payments[idx];
    }
    return null;
  }

  function getMonthSummary(month) {
    ensureMonthPayments(month);
    const payments = getPaymentsByMonth(month);
    const patients = getPatients();
    let received = 0, pending = 0;
    payments.forEach(pay => {
      const patient = patients.find(p => p.id === pay.patientId);
      if (!patient || !patient.active) return;
      if (pay.paid) received += pay.value;
      else pending += pay.value;
    });
    return { received, pending, total: received + pending };
  }

  // ─── CANCELS (week overrides) ─────────────────────────────
  /**
   * Cancel schema: { patientId, weekStart ("YYYY-MM-DD") }
   * weekStart = Monday of that week
   */
  function getCancels() {
    return getAll(KEYS.CANCELS);
  }

  function isSessionCancelled(patientId, weekStart) {
    return getCancels().some(c => c.patientId === patientId && c.weekStart === weekStart);
  }

  function toggleCancel(patientId, weekStart) {
    const cancels = getCancels();
    const idx = cancels.findIndex(c => c.patientId === patientId && c.weekStart === weekStart);
    if (idx >= 0) {
      cancels.splice(idx, 1); // Reactivate
    } else {
      cancels.push({ patientId, weekStart }); // Cancel
    }
    setAll(KEYS.CANCELS, cancels);
    return !cancels.some(c => c.patientId === patientId && c.weekStart === weekStart);
  }

  // ─── SETTINGS ────────────────────────────────────────────
  function getSettings() {
    return getStored(KEYS.SETTINGS, {});
  }

  function saveSettings(data) {
    const current = getSettings();
    setStored(KEYS.SETTINGS, { ...current, ...data });
  }

  // ─── DATE UTILS ─────────────────────────────────────────
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day); // Monday = weekStart
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }

  function getWeekDays(weekStart) {
    const days = [];
    const start = new Date(weekStart + 'T12:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  function getDayName(dateStr) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const d = new Date(dateStr + 'T12:00:00');
    return days[d.getDay()];
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }

  function prevMonth(monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function nextMonth(monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    const d = new Date(year, month, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getDayOfWeekName(dow) {
    const names = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
                   'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return names[dow] || '';
  }

  function isDemoPatient(patient) {
    return patient?.isDemo === true || DEMO_PATIENTS.some(demo =>
      patient?.name === demo.name && patient?.phone === demo.phone
    );
  }

  function clearDemoData() {
    const demoIds = new Set(getPatients().filter(isDemoPatient).map(patient => patient.id));
    if (demoIds.size === 0) return;

    setAll(KEYS.PATIENTS, getPatients().filter(patient => !demoIds.has(patient.id)));
    setAll(KEYS.PAYMENTS, getPayments().filter(payment => !demoIds.has(payment.patientId)));
    setAll(KEYS.CANCELS, getCancels().filter(cancel => !demoIds.has(cancel.patientId)));
  }

  function importCollection(value, fallback) {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    return decode(value, fallback);
  }

  function exportBackup() {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      patients: getPatients(),
      payments: getPayments(),
      cancels: getCancels(),
      settings: getSettings(),
    };
  }

  function importBackup(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup');
    }

    setAll(KEYS.PATIENTS, importCollection(data.patients, []));
    setAll(KEYS.PAYMENTS, importCollection(data.payments, []));
    setAll(KEYS.CANCELS, importCollection(data.cancels, []));
    setStored(KEYS.SETTINGS, importCollection(data.settings, {}));
  }

  function resetAll({ keepInstallFlag = true } = {}) {
    const hasInstalled = localStorage.getItem('psy_has_installed');
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    if (!keepInstallFlag) {
      localStorage.removeItem('psy_has_installed');
    } else if (hasInstalled) {
      localStorage.setItem('psy_has_installed', hasInstalled);
    }
    window.Store?.publish('db:reset', {});
  }

  // Seed demo data if no patients exist
  function seedDemoData() {
    if (getPatients().length > 0) return;
    DEMO_PATIENTS.forEach(demo => savePatient({ ...demo, isDemo: true }));

    const month = getCurrentMonth();
    ensureMonthPayments(month);
    // Mark first patient as paid
    const patients = getPatients();
    if (patients.length > 0) {
      togglePayment(patients[0].id, month);
    }
  }

  return {
    getPatients, getPatient, savePatient, deletePatient, getActivePatients,
    getPayments, getPaymentsByMonth, getPaymentForPatient, ensureMonthPayments,
    togglePayment, getMonthSummary,
    getCancels, isSessionCancelled, toggleCancel,
    getSettings, saveSettings,
    getCurrentMonth, getWeekStart, getWeekDays, getDayName,
    formatCurrency, formatMonth, prevMonth, nextMonth,
    getInitials, getDayOfWeekName, seedDemoData, clearDemoData,
    exportBackup, importBackup, resetAll, uid,
    AVATAR_COLORS,
  };
})();

window.DB = DB;
