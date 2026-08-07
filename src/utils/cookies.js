export function getCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = part.slice(0, separatorIndex).trim();
    if (key === name) return decodeURIComponent(part.slice(separatorIndex + 1).trim());
  }

  return undefined;
}
