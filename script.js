/***********************************************************
 * MENU & CHAT
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
 * PAGE SWITCHING
 ************************************************************/
function showPage(pageId) {
  const pages = document.querySelectorAll('.main-content > section');
  pages.forEach((page) => {
    page.style.display = 'none';
  });
  document.getElementById(pageId).style.display = 'block';
  sideMenu.classList.remove('open');
}

/***********************************************************
 * FULL-PAGE OVERLAY (DETAIL VIEW) + AI CHAT
 ************************************************************/
const detailOverlay = document.getElementById('detailOverlay');
const closeOverlay = document.getElementById('closeOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayBody = document.getElementById('overlayBody');
const overlayChatMsg = document.getElementById('overlayChatMsg');
const overlayChatSend = document.getElementById('overlayChatSend');
const overlayChatHistory = document.getElementById('overlayChatHistory');

function openDetailOverlay(titleText, bodyHtml) {
  overlayTitle.textContent = titleText;
  overlayBody.innerHTML = bodyHtml;
  overlayChatHistory.innerHTML = ''; // Clear chat each time if you like
  detailOverlay.classList.add('open');
}

closeOverlay.addEventListener('click', () => {
  detailOverlay.classList.remove('open');
});

overlayChatSend.addEventListener('click', () => {
  const userMsg = overlayChatMsg.value.trim();
  if (userMsg) {
    const userDiv = document.createElement('div');
    userDiv.className = 'overlay-user-msg';
    userDiv.textContent = userMsg;
    overlayChatHistory.appendChild(userDiv);

    // Clear input
    overlayChatMsg.value = '';
    overlayChatHistory.scrollTop = overlayChatHistory.scrollHeight;

    // TODO: You could send userMsg to an AI API, get response, display it, etc.
    const aiResponse = "I'm just a demo AI. Thanks for your question!";
    const aiDiv = document.createElement('div');
    aiDiv.className = 'overlay-ai-msg';
    aiDiv.textContent = aiResponse;
    overlayChatHistory.appendChild(aiDiv);
    overlayChatHistory.scrollTop = overlayChatHistory.scrollHeight;
  }
});

/***********************************************************
 * COLLAPSIBLE BOXES: Each item is collapsed by default
 ************************************************************/
function createCollapsibleBox(title, summaryHtml, overlayTitleText, overlayBodyHtml) {
  // Outer box
  const box = document.createElement('div');
  box.classList.add('card'); // using .card for styling, but it’s actually a collapsible box

  // Header (collapsed by default)
  const header = document.createElement('div');
  header.classList.add('card-header', 'collapsible-header');
  // We store .isCollapsed in JS
  let isCollapsed = true;

  const h2 = document.createElement('h2');
  h2.textContent = title;
  header.appendChild(h2);

  // Expand/Collapse arrow or indicator
  const toggleIcon = document.createElement('span');
  toggleIcon.classList.add('toggle-button', 'material-symbols-outlined');
  toggleIcon.textContent = 'expand_more';
  header.appendChild(toggleIcon);

  // Body (hidden by default)
  const body = document.createElement('div');
  body.classList.add('card-body');
  body.style.display = 'none';

  // Summary goes in body
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = summaryHtml;
  body.appendChild(summaryDiv);

  // Full View button => opens overlay
  const fullBtn = document.createElement('button');
  fullBtn.textContent = 'Full View';
  fullBtn.classList.add('expand-btn');
  fullBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent also toggling
    openDetailOverlay(overlayTitleText, overlayBodyHtml);
  });
  body.appendChild(fullBtn);

  // Header click toggles body
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

  // Put together
  box.appendChild(header);
  box.appendChild(body);
  return box;
}

/***********************************************************
 * LOAD "LIFE GOALS" (goals.json)
 ************************************************************/
async function loadGoals() {
  try {
    const res = await fetch('data/goals.json');
    const data = await res.json();
    const container = document.getElementById('goalsContainer');
    container.innerHTML = '';

    data.lifeGoals.forEach((goal) => {
      const summary = `<p><strong>Target Date:</strong> ${goal.targetDate}</p>`;
      let overlayHtml = `<p><strong>Milestones:</strong> ${goal.milestones.join(', ')}</p>`;

      if (goal.checklist) {
        overlayHtml += `<p><strong>Checklist:</strong></p><ul>`;
        goal.checklist.forEach(item => {
          overlayHtml += `<li>${item.label}</li>`;
        });
        overlayHtml += `</ul>`;
      }
      if (goal.advisorPrompt) {
        overlayHtml += `<p><em>Advisor Prompt:</em> ${goal.advisorPrompt}</p>`;
      }

      const box = createCollapsibleBox(
        goal.title,
        summary,
        goal.title,
        overlayHtml
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

    // Title for the page
    const monthLabel = data.monthLabel || 'This Month';
    
    data.events.forEach((evt) => {
      const summary = `<p><strong>Date:</strong> ${evt.date}</p>`;
      const overlayHtml = `<p>More info about <em>${evt.name}</em> goes here.</p>`;
      const box = createCollapsibleBox(
        evt.name,         // box title
        summary,          // collapsed summary
        evt.name,         // overlay title
        overlayHtml       // overlay body
      );
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
      const overlayHtml = `<p>Detailed plan steps for <strong>${p.goalName}</strong>, currently at ${p.progress}% progress.</p>`;
      const box = createCollapsibleBox(
        p.goalName,
        summary,
        p.goalName,
        overlayHtml
      );
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
      const overlayHtml = `<p>Bank Account Details: $${data.balances.bank.toLocaleString()}</p>`;
      const box = createCollapsibleBox(
        'Bank Account',
        summary,
        'Bank Account',
        overlayHtml
      );
      container.appendChild(box);
    }
    // Investments
    {
      const summary = `<p>$${data.balances.investments.toLocaleString()}</p>`;
      const overlayHtml = `<p>Investment Details: $${data.balances.investments.toLocaleString()}</p>`;
      const box = createCollapsibleBox(
        'Investments',
        summary,
        'Investments',
        overlayHtml
      );
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
  // Default page
  showPage('life');

  // Load all data (so each page is ready if user switches)
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();
});