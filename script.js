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

/***********************************************************
 * PERFORMANCE DATA & CHART
 ************************************************************/
let performanceMap = {}; // { retirement: [ {month, value}, ... ], house: [...], etc. }

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
    // No data
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
}

/***********************************************************
 * OPEN OVERLAY (with chart) 
 ************************************************************/
function openDetailOverlay(goalId, titleText, bodyHtml, { 
  checklist = [], 
  attachments = [], 
  photos = []
} = {}) {
  overlayTitle.textContent = titleText;
  overlayBody.innerHTML = bodyHtml;

  // Clear old
  overlayChecklist.innerHTML = '';
  overlayAttachments.innerHTML = '';
  overlayPhotos.innerHTML = '';
  overlayChatHistory.innerHTML = '';

  // checklist
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

  // attachments
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

  // photos
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || 'Photo';
    overlayPhotos.appendChild(img);
  });

  detailOverlay.classList.add('open');

  // Load performance for this goalId
  const points = performanceMap[goalId] || [];
  drawPerformanceChart('overlayPerformanceCanvas', points);
}

closeOverlayBtn.addEventListener('click', () => {
  detailOverlay.classList.remove('open');
});

// Add to Calendar
overlayCalendarBtn.addEventListener('click', () => {
  alert('Calendar event added (placeholder)!');
});

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

    // AI response
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
 * CREATE COLLAPSIBLE CARDS
 ************************************************************/
function createCollapsibleCard(goalId, title, summaryHtml, overlayOpts) {
  const card = document.createElement('div');
  card.classList.add('card');

  const header = document.createElement('div');
  header.classList.add('card-header');
  header.classList.add('collapsible-header');
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

  // summary
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = summaryHtml;
  body.appendChild(summaryDiv);

  // Full View -> overlay
  const fullBtn = document.createElement('button');
  fullBtn.textContent = 'Full View';
  fullBtn.classList.add('expand-btn');
  fullBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDetailOverlay(goalId, title, overlayOpts.bodyHtml || '', {
      checklist: overlayOpts.checklist || [],
      attachments: overlayOpts.attachments || [],
      photos: overlayOpts.photos || []
    });
  });
  body.appendChild(fullBtn);

  // toggle collapsible
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
 * LOAD GOALS (life)
 ************************************************************/
async function loadGoals() {
  try {
    const res = await fetch('data/goals.json');
    const data = await res.json();
    const container = document.getElementById('goalsContainer');
    container.innerHTML = '';

    data.lifeGoals.forEach((goal) => {
      // summary
      const summary = `<p><strong>Target Date:</strong> ${goal.targetDate}</p>`;
      let detailsHtml = `<p><strong>Milestones:</strong> ${goal.milestones.join(', ')}</p>`;
      if (goal.advisorPrompt) {
        detailsHtml += `<p><em>Advisor Prompt:</em> ${goal.advisorPrompt}</p>`;
      }

      const attachments = [
        { name: 'GoalPlan.pdf', url: '#' }
      ];
      const photos = [
        { src: 'https://via.placeholder.com/80', alt: 'Placeholder 1' }
      ];
      const checklist = goal.checklist || [];

      // we pass goal.id for the performance chart
      const card = createCollapsibleCard(goal.id, goal.title, summary, {
        bodyHtml: detailsHtml,
        attachments,
        photos,
        checklist
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
      const summary = `<p><strong>Date:</strong> ${evt.date}</p>`;
      const detailsHtml = `<p>Extra info about "${evt.name}" here.</p>`;

      // We pass an ID like "calendar-"+evt.name if you want
      const card = createCollapsibleCard(`calendar-${evt.name}`, evt.name, summary, {
        bodyHtml: detailsHtml
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
      const summary = `<p><strong>Progress:</strong> ${p.progress}%</p>`;
      const detailsHtml = `<p>Plan details for ${p.goalName}, progress: ${p.progress}%</p>`;

      // ID could be something like "plan-" + p.goalName
      const card = createCollapsibleCard(`plan-${p.goalName}`, p.goalName, summary, {
        bodyHtml: detailsHtml
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

    // Suppose money.json has "balances" object
    Object.keys(data.balances).forEach((key) => {
      const amount = data.balances[key];
      const summary = `<p><strong>Amount:</strong> $${amount.toLocaleString()}</p>`;
      const detailsHtml = `<p>Detailed info for ${key}: $${amount.toLocaleString()}</p>`;

      // ID could be "money-"+key
      const card = createCollapsibleCard(`money-${key}`, key, summary, {
        bodyHtml: detailsHtml
      });
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
  // Load performance first
  await loadPerformance();

  // Then load each page's data
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();

  // Default page is "Life"
  showPage('life');
});