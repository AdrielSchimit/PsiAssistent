// PsyAssist — WhatsApp Integration

const WhatsApp = (() => {
  function getTemplate() {
    const settings = DB.getSettings();
    return settings.whatsappTemplate || 'Olá {nome}, passando para lembrar sobre o pagamento da nossa última sessão 😊';
  }

  function saveTemplate(text) {
    DB.saveSettings({ whatsappTemplate: text });
  }

  function formatPhone(phone) {
    // Remove all non-numeric chars
    let cleaned = phone.replace(/\D/g, '');
    // If no country code, assume Brazil (55)
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  }

  function buildLink(patient, value) {
    if (!patient.phone) return null;
    const template = getTemplate();
    const message = template
      .replace(/{nome}/g, patient.name.split(' ')[0])
      .replace(/{valor}/g, DB.formatCurrency(value));
    
    const phone = formatPhone(patient.phone);
    const encodedMessage = encodeURIComponent(message);
    
    // Check if mobile device to use app intent or web link
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      return `whatsapp://send?phone=${phone}&text=${encodedMessage}`;
    } else {
      return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
  }

  function sendReminder(patient, value) {
    const link = buildLink(patient, value);
    if (!link) {
      App.toast('Telefone não cadastrado.', 'error');
      return;
    }
    window.open(link, '_blank');
  }

  return { getTemplate, saveTemplate, sendReminder };
})();

window.WhatsApp = WhatsApp;
