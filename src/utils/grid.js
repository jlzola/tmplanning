export function groupByBand(grid) {
  const byBand = new Map();
  grid.forEach((cell) => {
    if (!byBand.has(cell.band)) byBand.set(cell.band, []);
    byBand.get(cell.band).push(cell);
  });
  return [...byBand.entries()].map(([band, cells]) => ({ band, cells }));
}
