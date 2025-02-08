/***********************************************************
 * MENU & GLOBAL CHAT
 ************************************************************/
const menuToggle = document.getElementById('menuToggle');
const closeMenu = document.getElementById('closeMenu');
const sideMenu = document.getElementById('sideMenu');

menuToggle.addEventListener('click', () => {
  sideMenu.classList.add('open');
});
closeMenu.addEventListener('click', () => {
  sideMenu.classList.remove('open');
});

const chatToggle = document.getElementById('chatToggle');
const chatOverlay = document.getElementById('chatOverlay');
const closeChat = document.getElementById('closeChat');
const chatHistory = document.getElementById('chatHistory');
const sendChat = document.getElementById('sendChat');
const chatMessageInput = document.getElementById('chatMessage');

chatToggle.addEventListener('click', () => {
  chatOverlay.classList.add('open');
});
closeChat.addEventListener('click', () => {
  chatOverlay.classList.remove('open');
});
sendChat.addEventListener('click', () => {
  const message = chatMessageInput.value.trim();
  if (message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    msgDiv.textContent = message;
    chatHistory.appendChild(msgDiv);
    chatMessageInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
});

/***********************************************************
 * PAGE SWITCH
 ************************************************************/
function showPage(pageId) {
  const pages = document.querySelectorAll('.main-content > section');
  pages.forEach((p) => p.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
  sideMenu.classList.remove('open');
}

/***********************************************************
 * BOTTOM-SHEET OVERLAY
 ************************************************************/
const detailOverlay = document.getElementById('detailOverlay');
const closeOverlayBtn = document.getElementById('closeOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayBody = document.getElementById('overlayBody');
const overlayChecklist = document.getElementById('overlayChecklist');
const overlayAttachments = document.getElementById('overlayAttachments');
const overlayPhotos = document.getElementById('overlayPhotos');
const overlayCalendarBtn = document.getElementById('overlayCalendarBtn');

const overlayChatMsg = document.getElementById('overlayChatMsg');
const overlayChatSend = document.getElementById('overlayChatSend');
const overlayChatHistory = document.getElementById('overlayChatHistory');

closeOverlayBtn.addEventListener('click', () => {
  detailOverlay.classList.remove('open');
});

overlayCalendarBtn.addEventListener('click', () => {
  alert('Event added to calendar (placeholder)!');
});

/***********************************************************
 * PERFORMANCE DATA & INTERACTIVE CHART
 ************************************************************/
let performanceMap = {}; // if you want global performance data for certain goals

async function loadPerformance() {
  try {
    const res = await fetch('data/performance.json');
    const data = await res.json();
    performanceMap = data.performanceData || {};
  } catch (err) {
    console.error('Error loading performance.json:', err);
  }
}

/**
 * drawPerformanceChart(canvasId, points):
 *  Expects "points" to be an array of objects like:
 *  [ { label: "Jan 1", value: 1000 }, { label: "Jan 15", value: 1200 } ]
 */
function drawPerformanceChart(canvasId, points) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!points || !points.length) {
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter';
    ctx.fillText('No performance data', 10, 30);
    return;
  }

  const values = points.map(p => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const leftPad = 40, rightPad = 20, topPad = 20, bottomPad = 30;
  const w = canvas.width - leftPad - rightPad;
  const h = canvas.height - topPad - bottomPad;

  // X axis
  ctx.strokeStyle = '#888';
  ctx.beginPath();
  ctx.moveTo(leftPad, canvas.height - bottomPad);
  ctx.lineTo(leftPad + w, canvas.height - bottomPad);
  ctx.stroke();

  // Plot line
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

  // If you want a tooltip, store chart meta
  canvas.chartData = { points, leftPad, rightPad, topPad, bottomPad, w, h, minVal, maxVal };
}

// Optional tooltip logic
const chartTooltip = document.getElementById('chartTooltip');
function handleChartMouseMove(e) {
  const canvas = e.target;
  if (!canvas.chartData) return;
  const { points, leftPad, rightPad, topPad, bottomPad, w, h, minVal, maxVal } = canvas.chartData;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
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
  const xFrac = iNear / (points.length - 1);
  const valRange = maxVal - minVal || 1;
  const yFrac = (pt.value - minVal) / valRange;
  const x = leftPad + xFrac * w;
  const y = (canvas.height - bottomPad) - (yFrac * h);

  chartTooltip.style.display = 'block';
  chartTooltip.style.left = (rect.left + x + 10) + 'px';
  chartTooltip.style.top = (rect.top + y - 20) + 'px';
  chartTooltip.textContent = `${pt.label}: $${pt.value.toLocaleString()}`;
}
function handleChartMouseLeave(e) {
  chartTooltip.style.display = 'none';
}
const overlayCanvas = document.getElementById('overlayPerformanceCanvas');
overlayCanvas.addEventListener('mousemove', handleChartMouseMove);
overlayCanvas.addEventListener('mouseleave', handleChartMouseLeave);

/***********************************************************
 * OPEN OVERLAY (for Full View)
 ************************************************************/
function openDetailOverlay(goalId, titleText, bodyHtml, { 
  checklist = [], 
  attachments = [], 
  photos = [],
  accounts = []
} = {}) {
  overlayTitle.textContent = titleText;
  overlayBody.innerHTML = bodyHtml;

  // clear old items
  overlayChecklist.innerHTML = '';
  overlayAttachments.innerHTML = '';
  overlayPhotos.innerHTML = '';
  overlayChatHistory.innerHTML = '';

  // fill checklist
  checklist.forEach(item => {
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = item.done || false;
    const label = document.createElement('label');
    label.textContent = item.label || 'Task';
    li.appendChild(cb);
    li.appendChild(label);
    overlayChecklist.appendChild(li);
  });

  // fill attachments
  attachments.forEach(att => {
    const div = document.createElement('div');
    div.classList.add('attachment-item');
    const link = document.createElement('a');
    link.href = att.url || '#';
    link.target = '_blank';
    link.textContent = att.name || 'Attachment';
    div.appendChild(link);
    overlayAttachments.appendChild(div);
  });

  // fill photos
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || 'Photo';
    overlayPhotos.appendChild(img);
  });

  // Instead of a bulleted list, build chart blocks for each account
  accounts.forEach((acct, i) => {
    // Container block
    const acctBlock = document.createElement('div');
    acctBlock.classList.add('overlay-account-block');
    overlayBody.appendChild(acctBlock);

    // Account name
    const acctName = document.createElement('h3');
    acctName.textContent = acct.name || `Account ${i+1}`;
    acctBlock.appendChild(acctName);

    // Period selector
    const periodSelect = document.createElement('select');
    ['1M', '3M', '6M'].forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      periodSelect.appendChild(opt);
    });
    acctBlock.appendChild(periodSelect);

    // Canvas for the chart
    const canvasId = `acctChart-${goalId}-${i}`;
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = canvasId;
    chartCanvas.width = 300;
    chartCanvas.height = 150;
    chartCanvas.addEventListener('mousemove', handleChartMouseMove);
    chartCanvas.addEventListener('mouseleave', handleChartMouseLeave);
    acctBlock.appendChild(chartCanvas);

    // Update chart function
    function updateChart() {
      const selectedPeriod = periodSelect.value;
      const points = acct.performanceData?.[selectedPeriod] || [];
      drawPerformanceChart(canvasId, points);
    }

    // Listen for changes
    periodSelect.addEventListener('change', updateChart);

    // Initial chart load
    updateChart();
  });

  // show overlay
  detailOverlay.classList.add('open');

  // If you still want a big chart for the entire section:
  const points = performanceMap[goalId] || [];
  drawPerformanceChart('overlayPerformanceCanvas', points);
}

/***********************************************************
 * OVERLAY CHAT
 ************************************************************/
overlayChatSend.addEventListener('click', () => {
  const userMsg = overlayChatMsg.value.trim();
  if (userMsg) {
    const userBubble = document.createElement('div');
    userBubble.classList.add('chat-bubble', 'user-bubble');
    userBubble.textContent = userMsg;
    overlayChatHistory.appendChild(userBubble);
    overlayChatMsg.value = '';
    overlayChatHistory.scrollTop = overlayChatHistory.scrollHeight;

    // AI response (placeholder)
    setTimeout(() => {
      const aiBubble = document.createElement('div');
      aiBubble.classList.add('chat-bubble', 'ai-bubble');
      aiBubble.textContent = "AI: Thanks for asking! (placeholder)";
      overlayChatHistory.appendChild(aiBubble);
      overlayChatHistory.scrollTop = overlayChatHistory.scrollHeight;
    }, 500);
  }
});

/***********************************************************
 * COLLAPSIBLE CARDS
 ************************************************************/
function createCollapsibleCard(goalId, title, summaryHtml, overlayOpts) {
  const card = document.createElement('div');
  card.classList.add('card');

  const header = document.createElement('div');
  header.classList.add('card-header');
  let isCollapsed = true;

  const h2 = document.createElement('h2');
  h2.textContent = title;
  header.appendChild(h2);

  const toggleIcon = document.createElement('span');
  toggleIcon.classList.add('toggle-button', 'material-symbols-outlined');
  toggleIcon.textContent = 'expand_more';
  header.appendChild(toggleIcon);

  const body = document.createElement('div');
  body.classList.add('card-body');

  // Insert summary text
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = summaryHtml;
  body.appendChild(summaryDiv);

  // Full View button
  const fullBtn = document.createElement('button');
  fullBtn.textContent = 'Full View';
  fullBtn.classList.add('expand-btn');
  fullBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDetailOverlay(goalId, title, overlayOpts.bodyHtml || '', overlayOpts);
  });
  body.appendChild(fullBtn);

  // Start collapsed
  body.style.display = 'none';

  // collapse toggling
  header.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      body.style.display = 'none';
      toggleIcon.textContent = 'expand_more';
    } else {
      body.style.display = 'block';
      toggleIcon.textContent = 'expand_less';
    }
  });

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

/***********************************************************
 * LOAD GOALS / CALENDAR / PLAN
 ************************************************************/
async function loadGoals() {
  // same as before
}
async function loadCalendar() {
  // same as before
}
async function loadPlan() {
  // same as before
}

/***********************************************************
 * LOAD MONEY
 ************************************************************/
async function loadMoney() {
  try {
    const res = await fetch('data/money.json');
    const data = await res.json();
    const container = document.getElementById('moneyContainer');
    container.innerHTML = '';

    (data.moneySections || []).forEach((section) => {
      // Card summary
      const summary = `<p><strong>Total:</strong> $${section.total.toLocaleString()}</p>`;

      // We won't build a bulleted list here; just pass a summary
      const card = createCollapsibleCard(
        `money-${section.id}`,
        section.title,
        summary,
        {
          bodyHtml: summary, // or some other text if you want
          accounts: section.accounts
        }
      );
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading money:', err);
  }
}

/***********************************************************
 * LIGHT / DARK MODE
 ************************************************************/
const darkModeCheckbox = document.getElementById('darkMode');
if (darkModeCheckbox) {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    darkModeCheckbox.checked = false;
  } else {
    darkModeCheckbox.checked = true;
  }

  darkModeCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  });
}

/***********************************************************
 * ON PAGE LOAD
 ************************************************************/
window.addEventListener('DOMContentLoaded', async () => {
  // load performance (if you want a big section chart)
  await loadPerformance();

  // load other data
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();

  showPage('life');
});