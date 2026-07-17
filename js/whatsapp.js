// PsyAssist — WhatsApp Integration

const WhatsApp = (() => {

  // === Templates por situação ===
  const DEFAULT_TEMPLATES = {
    cobranca:    'Olá {nome}, passando para lembrar sobre o pagamento de R$ {valor} da nossa última sessão 😊',
    lembrete:    'Olá {nome}! Passando para lembrar da sua consulta amanhã. Qualquer dúvida, estou à disposição 🗓️',
    aniversario: 'Feliz Aniversário, {nome}! 🎉 Que seu dia seja repleto de alegria e bem-estar!',
    retorno:     'Olá {nome}, sentimos sua falta! Quando quiser retomar nossas sessões, pode me chamar aqui 😊'
  };

  const TEMPLATE_LABELS = {
    cobranca:    '💰 Cobrança de Pagamento',
    lembrete:    '🗓️ Lembrete de Consulta',
    aniversario: '🎂 Parabéns / Aniversário',
    retorno:     '💬 Convite de Retorno'
  };

  function getTemplates() {
    const settings = DB.getSettings();
    return { ...DEFAULT_TEMPLATES, ...(settings.whatsappTemplates || {}) };
  }

  function getTemplate() {
    return getTemplates().cobranca;
  }

  function saveTemplate(text) {
    const settings = DB.getSettings();
    const templates = settings.whatsappTemplates || {};
    templates.cobranca = text;
    DB.saveSettings({ whatsappTemplates: templates });
  }

  function saveTemplateByKey(key, text) {
    const settings = DB.getSettings();
    const templates = settings.whatsappTemplates || {};
    templates[key] = text;
    DB.saveSettings({ whatsappTemplates: templates });
  }

  function getTemplateLabels() { return TEMPLATE_LABELS; }

  function formatPhone(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  }

  function buildLinkByKey(patient, value, templateKey = 'cobranca') {
    if (!patient.phone) return null;
    const templates = getTemplates();
    const template = templates[templateKey] || templates.cobranca;
    const message = template
      .replace(/{nome}/g, patient.name.split(' ')[0])
      .replace(/{valor}/g, DB.formatCurrency(value));

    const phone = formatPhone(patient.phone);
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile
      ? `whatsapp://send?phone=${phone}&text=${encodedMessage}`
      : `https://wa.me/${phone}?text=${encodedMessage}`;
  }

  function buildLink(patient, value) {
    return buildLinkByKey(patient, value, 'cobranca');
  }

  function sendReminder(patient, value) {
    const link = buildLink(patient, value);
    if (!link) { App.toast('Telefone não cadastrado.', 'error'); return; }
    window.open(link, '_blank');
  }

  function sendByKey(patient, value, key) {
    const link = buildLinkByKey(patient, value, key);
    if (!link) { App.toast('Telefone não cadastrado.', 'error'); return; }
    window.open(link, '_blank');
  }

  return { getTemplate, getTemplates, saveTemplate, saveTemplateByKey,
           getTemplateLabels, buildLink, sendReminder, sendByKey };
})();

window.WhatsApp = WhatsApp;
