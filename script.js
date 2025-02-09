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
 * GLOBAL ACCOUNTS MAP
 ************************************************************/
let accountsMap = {};

async function loadAccounts() {
  try {
    const res = await fetch('data/accounts.json');
    const data = await res.json();
    data.accounts.forEach(acct => {
      accountsMap[acct.id] = acct;
    });
  } catch (err) {
    console.error('Error loading accounts.json:', err);
  }
}

/***********************************************************
 * PERFORMANCE DATA & INTERACTIVE CHART
 ************************************************************/
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

  canvas.chartData = { points, leftPad, rightPad, topPad, bottomPad, w, h, minVal, maxVal };
}

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
  chartTooltip.style.display = 'block';
  chartTooltip.style.left = (rect.left + mouseX + 10) + 'px';
  chartTooltip.style.top = (rect.top + 10) + 'px';
  chartTooltip.textContent = `${pt.label}: $${pt.value.toLocaleString()}`;
}

function handleChartMouseLeave() {
  chartTooltip.style.display = 'none';
}

const overlayCanvas = document.getElementById('overlayPerformanceCanvas');
if (overlayCanvas) {
  overlayCanvas.addEventListener('mousemove', handleChartMouseMove);
  overlayCanvas.addEventListener('mouseleave', handleChartMouseLeave);
}

/***********************************************************
 * OPEN OVERLAY (Full View)
 ************************************************************/
function openDetailOverlay(goalId, titleText, bodyHtml, {
  checklist = [],
  attachments = [],
  photos = [],
  accounts = []
} = {}) {
  overlayTitle.textContent = titleText;

  // Clear old items
  overlayBody.innerHTML = '';
  overlayChecklist.innerHTML = '';
  overlayAttachments.innerHTML = '';
  overlayPhotos.innerHTML = '';
  overlayChatHistory.innerHTML = '';

  // Insert the summary text
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = bodyHtml;
  overlayBody.appendChild(summaryDiv);

  // If we have "accounts", display them in an .account-list
  if (accounts.length > 0) {
    const acctList = document.createElement('div');
    acctList.classList.add('account-list');

    accounts.forEach(acct => {
      const acctItem = document.createElement('div');
      acctItem.classList.add('account-item');

      const leftDiv = document.createElement('div');
      leftDiv.classList.add('account-left');
      leftDiv.textContent = acct.name;

      const rightDiv = document.createElement('div');
      rightDiv.classList.add('account-right');
      rightDiv.textContent = `$${acct.balance?.toLocaleString() || 0}`;

      acctItem.appendChild(leftDiv);
      acctItem.appendChild(rightDiv);
      acctList.appendChild(acctItem);
    });

    overlayBody.appendChild(acctList);
  }

  // Show overlay
  detailOverlay.classList.add('open');

  // Performance chart
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
 * COLLAPSIBLE CARDS
 ************************************************************/
function createCollapsibleCard(goalId, title, summaryHtml, overlayOpts = {}) {
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
  body.style.display = 'none';

  // Insert summary
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = summaryHtml;
  body.appendChild(summaryDiv);

  // "Full View" button
  const fullBtn = document.createElement('button');
  fullBtn.textContent = 'Full View';
  fullBtn.classList.add('expand-btn');
  fullBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDetailOverlay(goalId, title, overlayOpts.bodyHtml || '', overlayOpts);
  });
  body.appendChild(fullBtn);

  // Toggle collapse
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

    (data.lifeGoals || []).forEach((goal) => {
      // Build a summary with target date, milestones, etc.
      let summary = `<p><strong>Target Date:</strong> ${goal.targetDate || 'N/A'}</p>`;
      if (goal.milestones && goal.milestones.length > 0) {
        summary += `<p><strong>Milestones:</strong> ${goal.milestones.join(', ')}</p>`;
      }
      if (goal.advisorPrompt) {
        summary += `<p><em>AI Plan:</em> ${goal.advisorPrompt}</p>`;
      }

      // Convert accountIds to real accounts (for Retirement, etc.)
      let realAccounts = [];
      if (goal.accountIds) {
        realAccounts = goal.accountIds.map(id => accountsMap[id]).filter(Boolean);
      }

      const card = createCollapsibleCard(goal.id, goal.title, summary, {
        bodyHtml: summary,
        checklist: goal.checklist || [],
        accounts: realAccounts
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading goals:', err);
  }
}

/***********************************************************
 * LOAD CALENDAR (Optional)
 ************************************************************/
async function loadCalendar() {
  try {
    const res = await fetch('data/calendar.json');
    const data = await res.json();
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '';

    (data.events || []).forEach((evt) => {
      const summary = `<p><strong>Date:</strong> ${evt.date}</p>`;
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
 * LOAD PLAN (Optional)
 ************************************************************/
async function loadPlan() {
  try {
    const res = await fetch('data/plan.json');
    const data = await res.json();
    const container = document.getElementById('planContainer');
    container.innerHTML = '';

    (data.plans || []).forEach((p) => {
      let summary = `<p><strong>Progress:</strong> ${p.progress || 0}%</p>`;
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
      const realAccounts = (section.accountIds || []).map(id => accountsMap[id]).filter(Boolean);
      const summary = `<p><strong>Total:</strong> $${(section.total || 0).toLocaleString()}</p>`;

      const card = createCollapsibleCard(
        `money-${section.id}`,
        section.title,
        summary,
        {
          bodyHtml: summary,
          accounts: realAccounts,
          photos: section.photos || []
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
  // 1) load accounts + performance
  await loadAccounts();
  await loadPerformance();

  // 2) load the rest
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();

  // 3) default page
  showPage('life');
});