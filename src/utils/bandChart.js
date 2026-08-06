function escapeXml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

const WIDTH = 900;
const MARGIN_X = 55;
const LINE_HEIGHT = 24;
const TOP_MARGIN = 22;
const AXIS_GAP = 20; // espace entre l'axe et l'étiquette la plus proche

/**
 * Graphique SVG de l'occupation des bandes : axe des abscisses de QO-100 à
 * 160m, indicatif(s) + mode(s) affichés au-dessus de chaque bande occupée.
 */
export function renderBandChartSvg({ grid, bands, modes }) {
  const chartBands = [...bands].reverse();

  const byBand = new Map(chartBands.map((band) => [band, []]));
  grid.forEach((cell) => {
    if (!cell.free && byBand.has(cell.band)) byBand.get(cell.band).push(cell);
  });
  byBand.forEach((cells) => {
    cells.sort((a, b) => modes.indexOf(a.mode) - modes.indexOf(b.mode));
  });

  const maxStack = Math.max(1, ...[...byBand.values()].map((cells) => cells.length));
  const axisY = TOP_MARGIN + (maxStack - 1) * LINE_HEIGHT + AXIS_GAP;
  const labelY = axisY + 22;
  const height = labelY + 14;
  const step = chartBands.length > 1 ? (WIDTH - MARGIN_X * 2) / (chartBands.length - 1) : 0;

  const parts = [];
  parts.push(
    `<line x1="${MARGIN_X - 10}" y1="${axisY}" x2="${WIDTH - MARGIN_X + 10}" y2="${axisY}" stroke="#d5d8dc" stroke-width="1.5"/>`
  );

  chartBands.forEach((band, i) => {
    const x = MARGIN_X + i * step;
    const cells = byBand.get(band);

    parts.push(`<line x1="${x}" y1="${axisY - 4}" x2="${x}" y2="${axisY + 4}" stroke="#a0a8b4" stroke-width="1"/>`);
    parts.push(
      `<text x="${x}" y="${labelY}" text-anchor="middle" font-family="system-ui, Arial, sans-serif" ` +
      `font-size="12" font-weight="700" fill="#444">${escapeXml(band)}</text>`
    );

    if (cells.length > 0) {
      // Tige courte reliant l'axe au bas de la pile d'étiquettes (aucun chevauchement avec le texte)
      const stemTopY = axisY - AXIS_GAP + 6;
      parts.push(`<line x1="${x}" y1="${axisY}" x2="${x}" y2="${stemTopY}" stroke="#2969c7" stroke-width="2"/>`);
      parts.push(`<circle cx="${x}" cy="${axisY}" r="3.5" fill="#2969c7"/>`);

      cells.forEach((cell, j) => {
        const baselineY = axisY - AXIS_GAP - j * LINE_HEIGHT;
        parts.push(
          `<text x="${x}" y="${baselineY}" text-anchor="middle" font-family="system-ui, Arial, sans-serif" font-size="13">` +
          `<tspan font-weight="700" fill="#2969c7">${escapeXml(cell.operator)}</tspan>` +
          `<tspan fill="#8a94a3"> (${escapeXml(cell.mode)})</tspan>` +
          `</text>`
        );
      });
    }
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" width="100%" height="auto" ` +
    `role="img" aria-label="Répartition des bandes occupées par les opérateurs">` +
    `<rect x="0" y="0" width="${WIDTH}" height="${height}" fill="#ffffff"/>` +
    parts.join('') +
    `</svg>`
  );
}
