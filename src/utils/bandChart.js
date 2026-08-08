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
const CHAR_WIDTH_BOLD = 7.3; // largeur moyenne estimée d'un caractère de l'indicatif (gras, 13px)
const CHAR_WIDTH_REGULAR = 6.3; // largeur moyenne estimée d'un caractère de " (MODE)" (13px)
const LABEL_GAP = 10; // marge de sécurité entre deux indicatifs voisins

function estimateLabelHalfWidth(operator, mode) {
  const width = String(operator ?? '').length * CHAR_WIDTH_BOLD + ` (${mode})`.length * CHAR_WIDTH_REGULAR;
  return width / 2 + LABEL_GAP;
}

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

  const step = chartBands.length > 1 ? (WIDTH - MARGIN_X * 2) / (chartBands.length - 1) : 0;

  // Chaque bande démarre juste au-dessus de l'axe ; elle n'est décalée vers le haut que si sa
  // pile d'indicatifs empiéterait sur celle d'une bande voisine déjà placée (balayage gauche→droite,
  // en suivant le bord droit estimé de chaque indicatif déjà posé, ligne par ligne).
  const rowRightEdge = [];
  const shiftByIndex = new Map();
  chartBands.forEach((band, i) => {
    const cells = byBand.get(band);
    if (cells.length === 0) return;
    const x = MARGIN_X + i * step;

    let shift = 0;
    for (;;) {
      let collision = false;
      for (let j = 0; j < cells.length; j++) {
        const row = shift + j;
        const leftEdge = x - estimateLabelHalfWidth(cells[j].operator, cells[j].mode);
        if (rowRightEdge[row] !== undefined && leftEdge < rowRightEdge[row]) {
          collision = true;
          break;
        }
      }
      if (!collision) break;
      shift++;
    }

    shiftByIndex.set(i, shift);
    cells.forEach((cell, j) => {
      const row = shift + j;
      const rightEdge = x + estimateLabelHalfWidth(cell.operator, cell.mode);
      rowRightEdge[row] = Math.max(rowRightEdge[row] ?? -Infinity, rightEdge);
    });
  });

  const maxExtraRows = Math.max(
    0,
    ...[...shiftByIndex.entries()].map(([i, shift]) => shift + byBand.get(chartBands[i]).length - 1)
  );
  const axisY = TOP_MARGIN + maxExtraRows * LINE_HEIGHT + AXIS_GAP;
  const labelY = axisY + 22;
  const height = labelY + 14;

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
      const shift = shiftByIndex.get(i);
      const stemTopY = axisY - AXIS_GAP + 6;
      parts.push(`<line x1="${x}" y1="${axisY}" x2="${x}" y2="${stemTopY}" stroke="#2969c7" stroke-width="2"/>`);
      parts.push(`<circle cx="${x}" cy="${axisY}" r="3.5" fill="#2969c7"/>`);

      cells.forEach((cell, j) => {
        const baselineY = axisY - AXIS_GAP - (j + shift) * LINE_HEIGHT;
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
    `<rect x="0" y="0" width="${WIDTH}" height="${height}" fill="#eaf3fd"/>` +
    parts.join('') +
    `</svg>`
  );
}
