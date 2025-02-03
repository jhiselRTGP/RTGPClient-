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
  pages.forEach((page) => (page.style.display = 'none'));
  document.getElementById(pageId).style.display = 'block';
  sideMenu.classList.remove('open');
}

/***********************************************************
 * FULL-PAGE BOTTOM SHEET OVERLAY
 ************************************************************/
const detailOverlay = document.getElementById('detailOverlay');
const closeOverlayBtn = document.getElementById('closeOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayBody = document.getElementById('overlayBody');
const overlayChatMsg = document.getElementById('overlayChatMsg');
const overlayChatSend = document.getElementById('overlayChatSend');
const overlayChatHistory = document.getElementById('overlayChatHistory');

function openDetailOverlay(titleText, bodyHtml) {
  overlayTitle.textContent = titleText;
  overlayBody.innerHTML = bodyHtml;

  // Clear any previous chat
  overlayChatHistory.innerHTML = '';

  // Show the overlay (sheet slides up via CSS)
  detailOverlay.classList.add('open');
}

closeOverlayBtn.addEventListener('click', () => {
  detailOverlay.classList.remove('open');
});

/* Overlay AI Chat Send Button */
overlayChatSend.addEventListener('click', () => {
  const userMsg = overlayChatMsg.value.trim();
  if (userMsg) {
    const userDiv = document.createElement('div');
    userDiv.className = 'overlay-user-msg';
    userDiv.textContent = userMsg;
    overlayChatHistory.appendChild(userDiv);

    overlayChatMsg.value = '';
    overlayChatHistory.scrollTop = overlayChatHistory.scrollHeight;

    // Demo AI response
    const aiResponse = "Thanks for asking! I'm a demo AI.";
    const aiDiv = document.createElement('div');
    aiDiv.className = 'overlay-ai-msg';
    aiDiv.textContent = aiResponse;
    overlayChatHistory.appendChild(aiDiv);
    overlayChatHistory.scrollTop = overlayChatHistory.scrollHeight;
  }
});

/***********************************************************
 * COLLAPSIBLE BOXES
 ************************************************************/
function createCollapsibleBox(title, summaryHtml, overlayTitleText, overlayBodyHtml) {
  // Outer container
  const card = document.createElement('div');
  card.classList.add('card');

  // Header
  const header = document.createElement('div');
  header.classList.add('card-header', 'collapsible-header');
  let isCollapsed = true;

  const h2 = document.createElement('h2');
  h2.textContent = title;
  header.appendChild(h2);

  // Toggle icon
  const toggleIcon = document.createElement('span');
  toggleIcon.classList.add('toggle-button', 'material-symbols-outlined');
  toggleIcon.textContent = 'expand_more';
  header.appendChild(toggleIcon);

  // Body
  const body = document.createElement('div');
  body.classList.add('card-body');
  body.style.display = 'none'; // hidden by default

  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = summaryHtml;
  body.appendChild(summaryDiv);

  // Full View -> open bottom sheet
  const fullBtn = document.createElement('button');
  fullBtn.textContent = 'Full View';
  fullBtn.classList.add('expand-btn');
  fullBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // don’t also toggle collapse
    openDetailOverlay(overlayTitleText, overlayBodyHtml);
  });
  body.appendChild(fullBtn);

  // Click header to expand/collapse
  header.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    if (!isCollapsed) {
      body.style.display = 'block';
      toggleIcon.textContent = 'expand_less';
    } else {
      body.style.display = 'none';
      toggleIcon.textContent = 'expand_more';
    }
  });

  // Assembled
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

    data.lifeGoals.forEach((goal) => {
      const summary = `<p><strong>Target Date:</strong> ${goal.targetDate}</p>`;
      let detailsHtml = `<p><strong>Milestones:</strong> ${goal.milestones.join(', ')}</p>`;
      if (goal.advisorPrompt) {
        detailsHtml += `<p><em>Advisor Prompt:</em> ${goal.advisorPrompt}</p>`;
      }
      if (goal.checklist) {
        detailsHtml += `<p><strong>Checklist:</strong></p><ul>`;
        goal.checklist.forEach(item => {
          detailsHtml += `<li>${item.label}</li>`;
        });
        detailsHtml += `</ul>`;
      }

      const box = createCollapsibleBox(
        goal.title,   // Collapsed header
        summary,      // Summary HTML
        goal.title,   // Overlay Title
        detailsHtml   // Overlay Body
      );
      container.appendChild(box);
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
      const details = `<p>More info on ${evt.name} can go here.</p>`;
      const box = createCollapsibleBox(evt.name, summary, evt.name, details);
      container.appendChild(box);
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
      const details = `<p>Detailed steps for <strong>${p.goalName}</strong>, progress: ${p.progress}%</p>`;

      const box = createCollapsibleBox(p.goalName, summary, p.goalName, details);
      container.appendChild(box);
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

    // Bank
    {
      const summary = `<p>$${data.balances.bank.toLocaleString()}</p>`;
      const details = `<p>Details about Bank Account: $${data.balances.bank.toLocaleString()}</p>`;
      const box = createCollapsibleBox('Bank Account', summary, 'Bank Account', details);
      container.appendChild(box);
    }
    // Investments
    {
      const summary = `<p>$${data.balances.investments.toLocaleString()}</p>`;
      const details = `<p>Investments breakdown: $${data.balances.investments.toLocaleString()}</p>`;
      const box = createCollapsibleBox('Investments', summary, 'Investments', details);
      container.appendChild(box);
    }
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
  // Default page is "Life"
  showPage('life');

  // Load each page's data so they're ready
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();
});