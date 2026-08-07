export function slugify(text) {
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || 'session';
}

function escapeCsvField(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatFrequency(frequency) {
  if (frequency === undefined || frequency === null) return null;

  const trimmed = String(frequency).trim();
  if (!trimmed) return null;

  if (Number.isNaN(Number(trimmed))) {
    throw new Error('Fréquence invalide');
  }

  const [intPart, decPart = ''] = trimmed.split('.');
  const decimals = decPart.length < 2 ? decPart.padEnd(2, '0') : decPart;
  return `${intPart}.${decimals}`;
}

export function operatorsToCsv(operators) {
  const header = 'call,locator,department';
  const rows = operators.map((o) =>
    [o.call, o.locator, o.department].map(escapeCsvField).join(',')
  );
  return [header, ...rows].join('\r\n');
}
