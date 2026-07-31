import * as d3 from 'd3';
import renderSrTable from '../accessibility';
import {
  appendTrendFigure,
  buildLegendHtml,
  resolveLegendTarget,
  selectTickRows,
  formatCompactNumber,
  formatCount,
  formatPeriod,
  SUPPRESSED_LABEL,
  TREND_MARGIN,
} from '../utils';

const PRIMARY_STROKE_WIDTH = 3;
const DEFAULT_STROKE_WIDTH = 2;
const PRIMARY_AREA_OPACITY = 0.08;
const END_LABEL_MIN_GAP = 12;
// .series-line has stroke-linecap: round, so a short dash + round cap renders as dots.
const DASH_PATTERNS = { dotted: '1,6', dashed: '9,6' };

/**
 * Renders a multi-series enrollment count line chart with y-axis origin at 0.
 * Each series is labeled directly at its line's endpoint (name + value), so
 * there's no separate legend — the primary series (config.series[i].primary)
 * additionally renders bolder with a light area fill for emphasis.
 *
 * @param {string} selector - DOM container selector
 * @param {Array}  data      - Enrollment data rows (pre-sorted ascending)
 * @param {Object} config
 * @param {Array}  config.series     - [{ key, label, color?, primary? }]
 * @param {Function} [config.xAccessor] - Row → x-axis label / tooltip header
 * @param {Function} [config.xTickFormat] - Row → short x-axis tick text
 * @param {string} config.title       - Used for aria-label and sr-table caption
 * @param {Array}  config.tableColumns - [{ label, value(row) }] for sr table
 * @param {Function} [config.yTickFormat] - Value → axis tick / tooltip / end-label text
 */
function renderLineChart(selector, data, config) {
  const container = d3.select(selector);
  container.html('');

  if (!data || data.length === 0) return;

  const {
    series,
    xAccessor = formatPeriod,
    xTickFormat = xAccessor,
    title,
    tableColumns,
    yTickFormat = formatCompactNumber,
    legendSelector,
  } = config;

  const MARGIN = legendSelector ? { ...TREND_MARGIN, right: 16 } : TREND_MARGIN;

  const {
    svg, tooltip, width: W, height: H,
  } = appendTrendFigure(container, title);

  const xLabels = data.map(xAccessor);
  const xScale = d3.scalePoint().domain(xLabels).range([MARGIN.left, W - MARGIN.right]).padding(0.5);

  // d3.max skips null/NaN (suppressed) values on its own -- only a series
  // that's suppressed at every single period falls through to the ?? 0.
  const yMax = (d3.max(data, (d) => d3.max(series, (s) => d[s.key])) ?? 0) * 1.08;
  const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([H - MARGIN.bottom, MARGIN.top]);

  yScale.ticks(5).forEach((t) => {
    svg.append('line')
      .attr('class', 'gridline')
      .attr('x1', MARGIN.left).attr('x2', W - MARGIN.right)
      .attr('y1', yScale(t)).attr('y2', yScale(t));
    svg.append('text')
      .attr('class', 'tick-txt')
      .attr('x', MARGIN.left - 8).attr('y', yScale(t))
      .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
      .text(yTickFormat(t));
  });

  const tickRows = selectTickRows(svg, data, xTickFormat, W - MARGIN.left - MARGIN.right);
  svg.append('g').selectAll('text')
    .data(tickRows)
    .join('text')
    .attr('class', 'tick-txt')
    .attr('x', (d) => xScale(xAccessor(d)))
    .attr('y', H - MARGIN.bottom + 15)
    .attr('text-anchor', 'middle')
    .text((d) => xTickFormat(d));

  svg.append('line')
    .attr('class', 'axis-base')
    .attr('x1', MARGIN.left).attr('x2', W - MARGIN.right)
    .attr('y1', yScale(0)).attr('y2', yScale(0));

  const lastRow = data[data.length - 1];
  const lineGenerator = d3.line()
    .defined((d) => Number.isFinite(d.v))
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.v))
    .curve(d3.curveMonotoneX);
  const areaGenerator = d3.area()
    .defined((d) => Number.isFinite(d.v))
    .x((d) => xScale(d.x))
    .y0(yScale(0))
    .y1((d) => yScale(d.v))
    .curve(d3.curveMonotoneX);

  // A suppressed period's row still exists, but its value doesn't -- find
  // each series' own most recent real value (not just the last row, which
  // might itself be suppressed) to anchor its end marker/label/legend text.
  const lastFiniteRow = (s) => {
    for (let i = data.length - 1; i >= 0; i -= 1) {
      if (Number.isFinite(data[i][s.key])) return data[i];
    }
    return null;
  };

  series.forEach((s) => {
    // Keep the raw (possibly null) value -- defined() above skips it,
    // producing a visual gap instead of a fake dip to 0.
    const points = data.map((d) => ({ x: xAccessor(d), v: d[s.key] }));

    if (s.primary) {
      svg.append('path')
        .attr('d', areaGenerator(points))
        .attr('fill', s.color)
        .attr('fill-opacity', PRIMARY_AREA_OPACITY)
        .attr('stroke', 'none');
    }

    svg.append('path')
      .attr('class', 'series-line')
      .attr('stroke', s.color)
      .style('stroke-width', s.primary ? PRIMARY_STROKE_WIDTH : DEFAULT_STROKE_WIDTH)
      .style('stroke-dasharray', DASH_PATTERNS[s.dash] || null)
      .attr('d', lineGenerator(points));

    const markerRow = lastFiniteRow(s);
    if (markerRow) {
      svg.append('circle')
        .attr('class', 'marker-ring')
        .attr('cx', xScale(xAccessor(markerRow)))
        .attr('cy', yScale(markerRow[s.key]))
        .attr('r', s.primary ? 5 : 4.5)
        .attr('fill', s.color);
    }
  });

  if (legendSelector) {
    const legendItems = series.map((s) => {
      const markerRow = lastFiniteRow(s);
      return {
        label: `${s.label} ${markerRow ? yTickFormat(markerRow[s.key]) : SUPPRESSED_LABEL}`,
        color: s.color,
        dot: !s.dash,
        dashStyle: s.dash,
      };
    });
    resolveLegendTarget(container, legendSelector).html(buildLegendHtml(legendItems));
  } else {
    const endLabelX = xScale(xAccessor(lastRow)) + 10;
    const endLabels = series
      .map((s) => {
        const markerRow = lastFiniteRow(s);
        return markerRow ? { s, markerRow, y: yScale(markerRow[s.key]) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.y - b.y);
    endLabels.forEach((entry, i) => {
      if (i > 0 && entry.y - endLabels[i - 1].y < END_LABEL_MIN_GAP) {
        entry.y = endLabels[i - 1].y + END_LABEL_MIN_GAP;
      }
    });
    endLabels.forEach(({ s, markerRow, y }) => {
      svg.append('text')
        .attr('class', 'end-label')
        .attr('x', endLabelX)
        .attr('y', y + 4)
        .style('fill', s.color)
        .style('font-weight', s.primary ? 800 : 700)
        .text(`${s.label} ${yTickFormat(markerRow[s.key])}`);
    });
  }

  const crosshair = svg.append('line')
    .attr('class', 'crosshair')
    .attr('y1', MARGIN.top).attr('y2', H - MARGIN.bottom)
    .style('opacity', 0);
  const focusDots = svg.append('g');
  const totalSeries = series.find((s) => s.primary) || series[0];

  svg.append('rect')
    .attr('x', MARGIN.left).attr('y', MARGIN.top)
    .attr('width', Math.max(0, W - MARGIN.right - MARGIN.left))
    .attr('height', Math.max(0, H - MARGIN.bottom - MARGIN.top))
    .attr('fill', 'transparent')
    .style('cursor', 'crosshair')
    .on('mousemove', (event) => {
      const [mx] = d3.pointer(event, svg.node());
      let idx = 0;
      let best = Infinity;
      data.forEach((d, i) => {
        const dist = Math.abs(xScale(xAccessor(d)) - mx);
        if (dist < best) { best = dist; idx = i; }
      });
      const d = data[idx];
      const dx = xScale(xAccessor(d));

      crosshair.attr('x1', dx).attr('x2', dx).style('opacity', 1);
      focusDots.selectAll('*').remove();
      series.forEach((s) => {
        if (!Number.isFinite(d[s.key])) return;
        focusDots.append('circle')
          .attr('class', 'marker-ring')
          .attr('cx', dx).attr('cy', yScale(d[s.key]))
          .attr('r', 4).attr('fill', s.color);
      });

      tooltip.html(`<div class="tt-h">${xAccessor(d)}</div>${series.map((s) => `<div class="tt-row"><span class="lab"><span class="k" style="background:${s.color}"></span>${s.label}</span><span class="val">${Number.isFinite(d[s.key]) ? yTickFormat(d[s.key]) : formatCount(d[s.key])}</span></div>`).join('')}`);
      const rect = svg.node().getBoundingClientRect();
      const totalY = Number.isFinite(d[totalSeries.key]) ? yScale(d[totalSeries.key]) : MARGIN.top;
      tooltip.style('left', `${(dx * rect.width) / W}px`);
      tooltip.style('top', `${(totalY * rect.height) / H}px`);
      tooltip.style('opacity', 1);
    })
    .on('mouseleave', () => {
      crosshair.style('opacity', 0);
      focusDots.selectAll('*').remove();
      tooltip.style('opacity', 0);
    });

  renderSrTable(container, title, tableColumns, data);
}

export default renderLineChart;
