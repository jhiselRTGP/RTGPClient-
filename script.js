/***********************************************************
 * MENU & GLOBAL CHAT
 ************************************************************/
// (Same as before)...

/***********************************************************
 * PAGE SWITCH
 ************************************************************/
// (Same as before)...

/***********************************************************
 * BOTTOM-SHEET OVERLAY
 ************************************************************/
// (Same as before)...

/***********************************************************
 * PERFORMANCE DATA & INTERACTIVE CHART
 ************************************************************/
let performanceMap = {}; // e.g. { "retirement": [ {month, value}, ... ] }

async function loadPerformance() {
  try {
    const res = await fetch('data/performance.json');
    const data = await res.json();
    performanceMap = data.performanceData || {};
  } catch (err) {
    console.error('Error loading performance.json:', err);
  }
}

function drawPerformanceChart(canvasId, points) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // if no data
  if (!points || !points.length) {
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter';
    ctx.fillText('No performance data', 10, 30);
    return;
  }

  // find min & max
  const values = points.map(p => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const leftPad = 40, rightPad = 20, topPad = 20, bottomPad = 30;
  const w = canvas.width - leftPad - rightPad;
  const h = canvas.height - topPad - bottomPad;

  // x-axis
  ctx.strokeStyle = '#888';
  ctx.beginPath();
  ctx.moveTo(leftPad, canvas.height - bottomPad);
  ctx.lineTo(leftPad + w, canvas.height - bottomPad);
  ctx.stroke();

  ctx.strokeStyle = '#00ff7f';
  ctx.beginPath();
  points.forEach((pt, i) => {
    const xFrac = i / (points.length - 1);
    const valRange = maxVal - minVal || 1;
    const yFrac = (pt.value - minVal) / valRange;

    const x = leftPad + xFrac * w;
    const y = (canvas.height - bottomPad) - (yFrac * h);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // We store the chart meta so we can do interactive tooltip
  canvas.chartData = {
    points,
    leftPad, rightPad, topPad, bottomPad, w, h,
    minVal, maxVal
  };
}

// On mouse move, show tooltip
const chartTooltip = document.getElementById('chartTooltip');

function handleChartMouseMove(e) {
  const canvas = e.target;
  if (!canvas.chartData) return;
  const { points, leftPad, rightPad, topPad, bottomPad, w, h, minVal, maxVal } = canvas.chartData;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // find nearest point
  // we know xFrac = i / (points.length - 1)
  // x = leftPad + xFrac * w
  // invert to find i
  const relativeX = mouseX - leftPad;
  if (relativeX < 0 || relativeX > w) {
    chartTooltip.style.display = 'none';
    return;
  }
  const iFloat = (relativeX / w) * (points.length - 1);
  const iNear = Math.round(iFloat);
  if (iNear < 0 || iNear >= points.length) {
    chartTooltip.style.display = 'none';
    return;
  }

  const pt = points[iNear];
  // compute the x,y of that point again
  const xFrac = iNear / (points.length - 1);
  const valRange = maxVal - minVal || 1;
  const yFrac = (pt.value - minVal) / valRange;
  const x = leftPad + xFrac * w;
  const y = (canvas.height - bottomPad) - (yFrac * h);

  // position the tooltip near x,y
  chartTooltip.style.display = 'block';
  chartTooltip.style.left = (rect.left + x + 10) + 'px';
  chartTooltip.style.top = (rect.top + y - 20) + 'px';
  chartTooltip.textContent = `${pt.month}: $${pt.value.toLocaleString()}`;
}

function handleChartMouseLeave(e) {
  chartTooltip.style.display = 'none';
}

/***********************************************************
 * OPEN OVERLAY
 ************************************************************/
function openDetailOverlay(goalId, titleText, bodyHtml, { 
  checklist = [], 
  attachments = [], 
  photos = []
} = {}) {
  // (Same code as before for setting text, clearing old data, etc.)
  detailOverlay.classList.add('open');

  // Draw performance chart
  const points = performanceMap[goalId] || [];
  drawPerformanceChart('overlayPerformanceCanvas', points);
}

/***********************************************************
 * CLICK / HOVER HANDLERS FOR CANVAS
 ************************************************************/
const overlayCanvas = document.getElementById('overlayPerformanceCanvas');
overlayCanvas.addEventListener('mousemove', handleChartMouseMove);
overlayCanvas.addEventListener('mouseleave', handleChartMouseLeave);

/***********************************************************
 * LOAD GOALS, CALENDAR, PLAN, MONEY
 ************************************************************/
// (Same as before)...

/***********************************************************
 * LIGHT / DARK MODE
 ************************************************************/
// (Same as before)...

/***********************************************************
 * ON PAGE LOAD
 ************************************************************/
window.addEventListener('DOMContentLoaded', async () => {
  // 1) load performance data
  await loadPerformance();

  // 2) load other data
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();

  // default page
  showPage('life');
});