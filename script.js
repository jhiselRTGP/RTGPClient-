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
    const newMessage = document.createElement('div');
    newMessage.className = 'chat-message';
    newMessage.textContent = message;
    chatHistory.appendChild(newMessage);
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
 * FULL-PAGE OVERLAY HANDLING
 ************************************************************/
const cardOverlay = document.getElementById('cardOverlay');
const closeOverlayBtn = document.getElementById('closeOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayBody = document.getElementById('overlayBody');

function openCardOverlay(titleText, detailsHtml) {
  overlayTitle.textContent = titleText;
  overlayBody.innerHTML = detailsHtml || '';
  cardOverlay.classList.add('open');
}

closeOverlayBtn.addEventListener('click', () => {
  cardOverlay.classList.remove('open');
});

/***********************************************************
 * LIFE (GOALS) PAGE
 ************************************************************/
async function loadGoals() {
  try {
    const res = await fetch('data/goals.json');
    const data = await res.json();
    const container = document.getElementById('goalsContainer');
    container.innerHTML = '';

    data.lifeGoals.forEach((goal) => {
      // Create card
      const card = document.createElement('div');
      card.classList.add('card');

      // Header
      const header = document.createElement('div');
      header.classList.add('card-header');
      const titleH2 = document.createElement('h2');
      titleH2.textContent = goal.title;
      header.appendChild(titleH2);

      // Body
      const body = document.createElement('div');
      body.classList.add('card-body');

      // Basic summary
      const summaryP = document.createElement('p');
      summaryP.innerHTML = `<strong>Target Date:</strong> ${goal.targetDate}`;
      body.appendChild(summaryP);

      // Expand button
      const expandBtn = document.createElement('button');
      expandBtn.textContent = 'Expand';
      expandBtn.classList.add('expand-btn');
      expandBtn.addEventListener('click', () => {
        // Build expanded HTML
        let detailsHtml = `<p><strong>Milestones:</strong> ${goal.milestones.join(', ')}</p>`;

        // If there's a checklist
        if (goal.checklist) {
          detailsHtml += `<h4>Checklist:</h4><ul>`;
          goal.checklist.forEach((item) => {
            detailsHtml += `<li>${item.label}</li>`;
          });
          detailsHtml += `</ul>`;
        }

        // Maybe show advisorPrompt
        if (goal.advisorPrompt) {
          detailsHtml += `<p><em>Advisor Prompt:</em> ${goal.advisorPrompt}</p>`;
        }

        openCardOverlay(goal.title, detailsHtml);
      });

      body.appendChild(expandBtn);

      // Put card together
      card.appendChild(header);
      card.appendChild(body);

      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading goals:', err);
  }
}

/***********************************************************
 * CALENDAR PAGE
 ************************************************************/
async function loadCalendar() {
  try {
    const res = await fetch('data/calendar.json');
    const data = await res.json();
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '';

    const monthH2 = document.createElement('h2');
    monthH2.textContent = data.monthLabel || 'This Month';
    container.appendChild(monthH2);

    data.events.forEach((evt) => {
      const card = document.createElement('div');
      card.classList.add('card');

      // Header
      const header = document.createElement('div');
      header.classList.add('card-header');
      const titleH2 = document.createElement('h2');
      titleH2.textContent = evt.name;
      header.appendChild(titleH2);

      // Body
      const body = document.createElement('div');
      body.classList.add('card-body');
      const dateP = document.createElement('p');
      dateP.innerHTML = `<strong>Date:</strong> ${evt.date}`;
      body.appendChild(dateP);

      // Expand button
      const expandBtn = document.createElement('button');
      expandBtn.textContent = 'Expand';
      expandBtn.classList.add('expand-btn');
      expandBtn.addEventListener('click', () => {
        const detailsHtml = `<p><strong>Date:</strong> ${evt.date}</p>`;
        openCardOverlay(evt.name, detailsHtml);
      });
      body.appendChild(expandBtn);

      card.appendChild(header);
      card.appendChild(body);
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading calendar:', err);
  }
}

/***********************************************************
 * PLAN PAGE
 ************************************************************/
async function loadPlan() {
  try {
    const res = await fetch('data/plan.json');
    const data = await res.json();
    const container = document.getElementById('planContainer');
    container.innerHTML = '';

    data.plans.forEach((p) => {
      const card = document.createElement('div');
      card.classList.add('card');

      // Header
      const header = document.createElement('div');
      header.classList.add('card-header');
      const titleH2 = document.createElement('h2');
      titleH2.textContent = p.goalName;
      header.appendChild(titleH2);

      // Body
      const body = document.createElement('div');
      body.classList.add('card-body');
      const progressP = document.createElement('p');
      progressP.innerHTML = `<strong>Progress:</strong> ${p.progress}%`;
      body.appendChild(progressP);

      // Expand button
      const expandBtn = document.createElement('button');
      expandBtn.textContent = 'Expand';
      expandBtn.classList.add('expand-btn');
      expandBtn.addEventListener('click', () => {
        const detailsHtml = `<p>Detailed plan steps for "${p.goalName}" could go here. Currently at ${p.progress}%.</p>`;
        openCardOverlay(p.goalName, detailsHtml);
      });
      body.appendChild(expandBtn);

      card.appendChild(header);
      card.appendChild(body);
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading plan:', err);
  }
}

/***********************************************************
 * MONEY PAGE
 ************************************************************/
async function loadMoney() {
  try {
    const res = await fetch('data/money.json');
    const data = await res.json();
    const container = document.getElementById('moneyContainer');
    container.innerHTML = '';

    // Bank
    const card1 = document.createElement('div');
    card1.classList.add('card');
    const header1 = document.createElement('div');
    header1.classList.add('card-header');
    const title1 = document.createElement('h2');
    title1.textContent = 'Bank Account';
    header1.appendChild(title1);

    const body1 = document.createElement('div');
    body1.classList.add('card-body');
    const bankP = document.createElement('p');
    bankP.textContent = `$${data.balances.bank.toLocaleString()}`;
    body1.appendChild(bankP);

    // Expand
    const expandBtn1 = document.createElement('button');
    expandBtn1.textContent = 'Expand';
    expandBtn1.classList.add('expand-btn');
    expandBtn1.addEventListener('click', () => {
      openCardOverlay('Bank Account', `<p>Balance: $${data.balances.bank.toLocaleString()}</p>`);
    });
    body1.appendChild(expandBtn1);

    card1.appendChild(header1);
    card1.appendChild(body1);
    container.appendChild(card1);

    // Investments
    const card2 = document.createElement('div');
    card2.classList.add('card');
    const header2 = document.createElement('div');
    header2.classList.add('card-header');
    const title2 = document.createElement('h2');
    title2.textContent = 'Investments';
    header2.appendChild(title2);

    const body2 = document.createElement('div');
    body2.classList.add('card-body');
    const investP = document.createElement('p');
    investP.textContent = `$${data.balances.investments.toLocaleString()}`;
    body2.appendChild(investP);

    // Expand
    const expandBtn2 = document.createElement('button');
    expandBtn2.textContent = 'Expand';
    expandBtn2.classList.add('expand-btn');
    expandBtn2.addEventListener('click', () => {
      openCardOverlay('Investments', `<p>Balance: $${data.balances.investments.toLocaleString()}</p>`);
    });
    body2.appendChild(expandBtn2);

    card2.appendChild(header2);
    card2.appendChild(body2);
    container.appendChild(card2);

  } catch (err) {
    console.error('Error loading money data:', err);
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

  // Load data for each page (so it's ready when we switch pages)
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();
});