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
/*
  If you’re using a separate performance.json, you can load it here.
  Or if you only use performance data in money.json or goals, skip this.
*/
let performanceMap = {};

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
 *  Expects an array of objects like:
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

  // Store chart data for optional tooltip
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
  const valRange = maxVal - minVal || 1;
  // (We could do more if we want the y position for the tooltip)
  chartTooltip.style.display = 'block';
  chartTooltip.style.left = (rect.left + mouseX + 10) + 'px';
  chartTooltip.style.top = (rect.top + 10) + 'px';
  chartTooltip.textContent = `${pt.label}: $${pt.value.toLocaleString()}`;
}

function handleChartMouseLeave(e) {
  chartTooltip.style.display = 'none';
}

const overlayCanvas = document.getElementById('overlayPerformanceCanvas');
if (overlayCanvas) {
  overlayCanvas.addEventListener('mousemove', handleChartMouseMove);
  overlayCanvas.addEventListener('mouseleave', handleChartMouseLeave);
}

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

  // Clear old items
  overlayChecklist.innerHTML = '';
  overlayAttachments.innerHTML = '';
  overlayPhotos.innerHTML = '';
  overlayChatHistory.innerHTML = '';

  // Checklist
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

  // Attachments
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

  // Photos
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || 'Photo';
    overlayPhotos.appendChild(img);
  });

  // If "accounts" is present (like on the Money overlay):
  // Build the mini-charts for each account
  accounts.forEach((acct, i) => {
    const acctBlock = document.createElement('div');
    acctBlock.classList.add('overlay-account-block');

    const acctTitle = document.createElement('h3');
    acctTitle.textContent = acct.name || `Account ${i+1}`;
    acctBlock.appendChild(acctTitle);

    // Period <select>
    const periodSelect = document.createElement('select');
    ['1M', '3M', '6M'].forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      periodSelect.appendChild(opt);
    });
    acctBlock.appendChild(periodSelect);

    // Canvas
    const canvasId = `acctChart-${goalId}-${i}`;
    const acctCanvas = document.createElement('canvas');
    acctCanvas.id = canvasId;
    acctCanvas.width = 300;
    acctCanvas.height = 150;
    acctCanvas.addEventListener('mousemove', handleChartMouseMove);
    acctCanvas.addEventListener('mouseleave', handleChartMouseLeave);
    acctBlock.appendChild(acctCanvas);

    // Update chart function
    function updateChart() {
      const selectedPeriod = periodSelect.value;
      const points = acct.performanceData?.[selectedPeriod] || [];
      drawPerformanceChart(canvasId, points);
    }

    periodSelect.addEventListener('change', updateChart);
    updateChart(); // initial load

    overlayBody.appendChild(acctBlock);
  });

  // Show the overlay
  detailOverlay.classList.add('open');

  // If you want a big chart for the entire goalId from performanceMap:
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

    // AI response placeholder
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
 * COLLAPSIBLE CARDS HELPER
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
  body.style.display = 'none'; // starts collapsed

  // Insert the "summaryHtml" for the collapsed section
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = summaryHtml;
  body.appendChild(summaryDiv);

  // "Full View" button → openDetailOverlay
  const fullBtn = document.createElement('button');
  fullBtn.textContent = 'Full View';
  fullBtn.classList.add('expand-btn');
  fullBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDetailOverlay(goalId, title, overlayOpts.bodyHtml || '', overlayOpts);
  });
  body.appendChild(fullBtn);

  // Toggle expand/collapse
  header.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    body.style.display = isCollapsed ? 'none' : 'block';
    toggleIcon.textContent = isCollapsed ? 'expand_more' : 'expand_less';
  });

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

/***********************************************************
 * LOAD GOALS
 ************************************************************/
async function loadGoals() {
  try {
    const res = await fetch('data/goals.json');
    const data = await res.json();
    const container = document.getElementById('goalsContainer');
    container.innerHTML = '';

    // "data.lifeGoals" is presumably an array of goals
    data.lifeGoals.forEach((goal) => {
      // Build a short summary for the collapsed card
      let summary = `<p><strong>Target Date:</strong> ${goal.targetDate || 'N/A'}</p>`;
      if (goal.milestones) {
        summary += `<p><strong>Milestones:</strong> ${goal.milestones.join(', ')}</p>`;
      }
      // Include the AI plan or advisor prompt
      if (goal.advisorPrompt) {
        summary += `<p><em>AI Plan:</em> ${goal.advisorPrompt}</p>`;
      }

      // If you want to show more details in "Full View," pass them in bodyHtml
      // or keep it simple and pass the same summary for now
      const card = createCollapsibleCard(goal.id, goal.title, summary, {
        bodyHtml: summary
        // attachments: [],
        // photos: [],
        // checklist: [],
        // ...
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading goals:', err);
  }
}

/***********************************************************
 * LOAD CALENDAR
 ************************************************************/
async function loadCalendar() {
  try {
    const res = await fetch('data/calendar.json');
    const data = await res.json();
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '';

    data.events.forEach((evt) => {
      let summary = `<p><strong>Date:</strong> ${evt.date}</p>`;
      summary += `<p>Description: ${evt.description || '(none)'}</p>`;
      // pass summary as collapsed view
      const card = createCollapsibleCard(`cal-${evt.name}`, evt.name, summary, {
        bodyHtml: summary
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading calendar:', err);
  }
}

/***********************************************************
 * LOAD PLAN
 ************************************************************/
async function loadPlan() {
  try {
    const res = await fetch('data/plan.json');
    const data = await res.json();
    const container = document.getElementById('planContainer');
    container.innerHTML = '';

    data.plans.forEach((p) => {
      let summary = `<p><strong>Goal Name:</strong> ${p.goalName}</p>`;
      summary += `<p><strong>Progress:</strong> ${p.progress}%</p>`;
      if (p.details) {
        summary += `<p>${p.details}</p>`;
      }

      const card = createCollapsibleCard(`plan-${p.goalName}`, p.goalName, summary, {
        bodyHtml: summary
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading plan:', err);
  }
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
      // Short summary
      const summary = `<p><strong>Total:</strong> $${section.total?.toLocaleString() || 0}</p>`;
      // Create a card
      const card = createCollapsibleCard(
        `money-${section.id}`,
        section.title,
        summary,
        {
          bodyHtml: summary,
          accounts: section.accounts // used in openDetailOverlay
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
  // If you have a separate performance.json for big section charts:
  await loadPerformance();

  // Then load each data set
  await loadGoals();    // loads data/goals.json
  await loadCalendar(); // loads data/calendar.json
  await loadPlan();     // loads data/plan.json
  await loadMoney();    // loads data/money.json

  // Default page
  showPage('life');
});