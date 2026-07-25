import * as d3 from 'd3';
import renderSrTable from './accessibility';

const SLOTS = ['A', 'B'];

// The larger bar is scaled down to this width (leaves visual margin instead
// of ever spanning the full card), and the smaller bar is scaled by the same
// factor -- so their true ratio (and thus a near-even split) stays accurate.
const HERO_BAR_MAX_WIDTH = 80;
// Floor so a very small share (e.g. a few percent) doesn't visually vanish.
const HERO_BAR_MIN_WIDTH = 4;

function formatMillions(n) {
  return `${(n / 1000000).toFixed(1)}M`;
}

/**
 * Updates the "total + split bar" hero card (see .dash-hero in
 * dashboard-v2.scss). Doesn't build DOM from scratch — the markup (ids
 * heroTotal/heroSeg{A,B}/etc.) already lives in hero-card.njk, so this just
 * fills it in. NOTE: assumes exactly 2 data points.
 *
 * @param {string} containerSelector - CSS selector for the hero <section>.
 * @param {{name: string, label: string, value: number}[]} data - exactly two items;
 *   value is a percent (0-100).
 * @param {number} totalEnrollment - raw total enrollment count (not in millions).
 * @param {Object} [config]
 * @param {string[]} [config.colors] - two CSS colors, indexed to match `data` order.
 * @param {string} [config.title] - Accessible name for the data; used as the
 *   sr-only table's <caption>.
 * @param {{label: string, value: Function}[]} [config.tableColumns] - Column
 *   definitions for the sr-only table.
 */
function renderEnrollmentHero(containerSelector, data, totalEnrollment, config = {}) {
  if (!data || data.length !== 2) {
    return { success: false, error: 'renderEnrollmentHero: expected exactly 2 data points.' };
  }
  if (!totalEnrollment) {
    return { success: false, error: 'renderEnrollmentHero: totalEnrollment is missing or zero.' };
  }

  const {
    colors = [],
    title = containerSelector,
    tableColumns = [
      { label: 'Program', value: (d) => d.name },
      { label: 'Percent of total', value: (d) => `${Math.round(d.value)}%` },
    ],
  } = config;

  const container = d3.select(containerSelector);
  if (container.empty()) {
    return { success: false, error: `renderEnrollmentHero: no element matches "${containerSelector}".` };
  }

  container.select('#heroTotal').text(formatMillions(totalEnrollment));

  const largerValue = Math.max(data[0].value, data[1].value, 1);
  const widthScale = HERO_BAR_MAX_WIDTH / largerValue;

  SLOTS.forEach((slot, i) => {
    const datum = data[i];
    const color = colors[i];
    const amount = (datum.value / 100) * totalEnrollment;
    const width = Math.max(Math.max(datum.value, 0) * widthScale, HERO_BAR_MIN_WIDTH);

    container.select(`#heroName${slot}`).text(datum.label ?? datum.name);
    container.select(`#heroSeg${slot}`)
      .style('background', color)
      .style('width', `${width}%`);
    container.select(`#heroBig${slot}`).text(formatMillions(amount));
    container.select(`#heroSub${slot}`).text(`${Math.round(datum.value)}%`);
  });

  container.select('#heroSplitBar')
    .attr('aria-label', `Enrollment split: ${data.map((d) => `${d.label ?? d.name} ${Math.round(d.value)}%`).join(', ')}`);

  // Re-rendered on every toggle, so drop the previous sr-only table first.
  container.select('.usa-sr-only.sr-only').remove();
  renderSrTable(container, title, tableColumns, data);

  return { success: true };
}

export default renderEnrollmentHero;
