// PsyAssist - Brazilian Portuguese voice parser

const VoiceParser = (() => {
  const NUMBER_VALUES = {
    zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4,
    cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
    onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14,
    quinze: 15, dezesseis: 16, dezassete: 17, dezessete: 17,
    dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40,
    cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
    cem: 100, cento: 100, duzentos: 200, duzentas: 200,
    trezentos: 300, trezentas: 300, quatrocentos: 400, quatrocentas: 400,
    quinhentos: 500, quinhentas: 500, seiscentos: 600, seiscentas: 600,
    setecentos: 700, setecentas: 700, oitocentos: 800, oitocentas: 800,
    novecentos: 900, novecentas: 900,
  };
  const WEEKDAYS = {
    domingo: 0, segunda: 1, 'segunda-feira': 1, terca: 2, 'terca-feira': 2,
    quarta: 3, 'quarta-feira': 3, quinta: 4, 'quinta-feira': 4,
    sexta: 5, 'sexta-feira': 5, sabado: 6,
  };
  const NUMBER_WORD = Object.keys(NUMBER_VALUES).join('|');
  const NUMBER_PHRASE = `(?:\\d+(?:[.,]\\d+)?|(?:${NUMBER_WORD})(?:\\s+(?:e\\s+)?(?:${NUMBER_WORD})){0,5}|mil)`;
  const NAME_STOP_WORDS = new Set([
    ...Object.keys(NUMBER_VALUES), ...Object.keys(WEEKDAYS), 'mil', 'feira',
    'hmm', 'hum', 'ahn', 'ah', 'eh', 'quero', 'gostaria', 'preciso', 'por',
    'favor', 'marcar', 'agendar', 'cadastrar', 'cadastre', 'adicionar', 'novo',
    'nova', 'paciente', 'cliente', 'nome', 'chamado', 'chamada', 'chama',
    'se', 'para', 'dia', 'data', 'horario', 'valor', 'hoje', 'amanha',
    'depois', 'as', 'a', 'h', 'hora', 'horas', 'minuto', 'minutos', 'meia',
    'real', 'reais', 'r', 'manha', 'tarde', 'noite',
  ]);
  const NAME_PARTICLES = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9:.,\-\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseNumber(value) {
    const normalized = normalize(value);
    if (/^\d+(?:[.,]\d+)?$/.test(normalized)) {
      return Number(normalized.replace(',', '.'));
    }

    let total = 0;
    let current = 0;
    let found = false;
    normalized.split(/\s+/).forEach(token => {
      if (token === 'e') return;
      if (token === 'mil') {
        total += (current || 1) * 1000;
        current = 0;
        found = true;
        return;
      }
      if (Object.hasOwn(NUMBER_VALUES, token)) {
        current += NUMBER_VALUES[token];
        found = true;
      }
    });
    return found ? total + current : null;
  }

  function parseDay(text, now) {
    if (/\bdepois de amanha\b/.test(text)) {
      const date = new Date(now);
      date.setDate(date.getDate() + 2);
      return date.getDay();
    }
    if (/\bamanha\b/.test(text)) {
      const date = new Date(now);
      date.setDate(date.getDate() + 1);
      return date.getDay();
    }
    if (/\bhoje\b/.test(text)) return now.getDay();

    for (const [day, value] of Object.entries(WEEKDAYS)) {
      if (new RegExp(`\\b${day}\\b`).test(text)) return value;
    }
    return null;
  }

  function normalizeClock(hour, minute, period) {
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    if ((period === 'tarde' || period === 'noite') && hour < 12) hour += 12;
    if (period === 'manha' && hour === 12) hour = 0;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  function parseTime(text) {
    const numeric = text.match(/\b([01]?\d|2[0-3])[:h]([0-5]\d)\b/);
    if (numeric) return normalizeClock(Number(numeric[1]), Number(numeric[2]), null);

    const patterns = [
      new RegExp(`\\b(?:as\\s+)?(${NUMBER_PHRASE})\\s+horas?(?:\\s+e\\s+(meia|${NUMBER_PHRASE})(?:\\s+minutos?)?)?(?:\\s+(?:da|de)\\s+(manha|tarde|noite))?\\b`),
      new RegExp(`\\b(?:as\\s+)?(${NUMBER_PHRASE})\\s+e\\s+(meia|${NUMBER_PHRASE})(?:\\s+minutos?)?(?:\\s+(?:da|de)\\s+(manha|tarde|noite))?\\b`),
      new RegExp(`\\b(?:as\\s+)?(${NUMBER_PHRASE})\\s+(?:da|de)\\s+(manha|tarde|noite)\\b`),
    ];

    for (let i = 0; i < patterns.length; i++) {
      const match = text.match(patterns[i]);
      if (!match) continue;
      const hour = parseNumber(match[1]);
      const minuteToken = i < 2 ? match[2] : null;
      const period = i < 2 ? match[3] : match[2];
      const minute = minuteToken === 'meia' ? 30 : (parseNumber(minuteToken) || 0);
      const time = normalizeClock(hour, minute, period);
      if (time) return time;
    }
    return null;
  }

  function parseValue(text) {
    const match = text.match(new RegExp(`\\b(${NUMBER_PHRASE})\\s+reais?\\b`));
    const value = match ? parseNumber(match[1]) : null;
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  function parseName(transcript) {
    const tokens = String(transcript || '').match(/[\p{L}]+(?:-[\p{L}]+)*|\d+(?:[:.,]\d+)?/gu) || [];
    const candidates = tokens.filter(token => {
      const clean = normalize(token);
      const filler = /^(?:h+m+|a+h+n*|e+h+)$/i.test(clean);
      return clean && !filler && !NAME_STOP_WORDS.has(clean) && !/^\d/.test(clean);
    });
    while (candidates.length && NAME_PARTICLES.has(normalize(candidates[0]))) candidates.shift();
    while (candidates.length && NAME_PARTICLES.has(normalize(candidates.at(-1)))) candidates.pop();

    return candidates.map((token, index) => {
      const clean = normalize(token);
      if (index > 0 && NAME_PARTICLES.has(clean)) return clean;
      return token.charAt(0).toLocaleUpperCase('pt-BR') + token.slice(1).toLocaleLowerCase('pt-BR');
    }).join(' ');
  }

  function parse(transcript, now = new Date()) {
    const text = normalize(transcript);
    return {
      name: parseName(transcript),
      dayOfWeek: parseDay(text, now),
      time: parseTime(text),
      valuePerSession: parseValue(text),
      transcript: String(transcript || '').trim(),
    };
  }

  return { parse, parseNumber };
})();

window.VoiceParser = VoiceParser;
