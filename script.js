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
 * ADD GOAL OVERLAY
 ************************************************************/
const floatingButton = document.getElementById('floatingButton');
const goalOverlay = document.getElementById('goalOverlay');
const closeGoal = document.getElementById('closeGoal');
const goalForm = document.getElementById('goalForm');

floatingButton.addEventListener('click', () => {
  goalOverlay.classList.add('show');
});

closeGoal.addEventListener('click', () => {
  goalOverlay.classList.remove('show');
});

goalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('goalName').value.trim();
  const progress = document.getElementById('goalProgress').value.trim();

  if (name && progress) {
    alert(`Goal "${name}" added with ${progress}% progress!`);
    // Additional logic to update your JSON or UI can go here

    // Reset form
    document.getElementById('goalName').value = '';
    document.getElementById('goalProgress').value = '';
    goalOverlay.classList.remove('show');
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
 * BUILD LIFE GOALS FROM JSON
 ************************************************************/
async function loadGoals() {
  try {
    const res = await fetch('data/goals.json'); // Make sure data/ folder is correct
    const data = await res.json();
    const goalsContainer = document.getElementById('goalsContainer');

    data.lifeGoals.forEach((goal) => {
      // Outer card
      const card = document.createElement('div');
      card.classList.add('card');

      // Card header
      const header = document.createElement('div');
      header.classList.add('card-header');

      const title = document.createElement('h2');
      title.textContent = goal.title;

      // Toggle icon
      const toggleIcon = document.createElement('span');
      toggleIcon.classList.add('toggle-button', 'material-symbols-outlined');
      toggleIcon.textContent = 'expand_more';

      // Card body
      const body = document.createElement('div');
      body.classList.add('card-body');
      body.id = `${goal.id}CardBody`;
      body.style.display = 'none';

      // Target date
      const targetP = document.createElement('p');
      targetP.innerHTML = `<strong>Target Date:</strong> ${goal.targetDate}`;

      // Milestones
      const milestonesP = document.createElement('p');
      milestonesP.innerHTML = `<strong>Milestones:</strong> ${goal.milestones.join(', ')}`;

      // Chart section
      const chartSection = document.createElement('div');
      chartSection.classList.add('chart-section');

      const perfH3 = document.createElement('h3');
      perfH3.textContent = 'Performance';
      const perfCanvas = document.createElement('canvas');
      perfCanvas.id = goal.performanceCanvasId;
      perfCanvas.width = 400;
      perfCanvas.height = 200;

      const progH3 = document.createElement('h3');
      progH3.textContent = 'Progress';
      const progCanvas = document.createElement('canvas');
      progCanvas.id = goal.progressCanvasId;
      progCanvas.width = 400;
      progCanvas.height = 200;

      chartSection.appendChild(perfH3);
      chartSection.appendChild(perfCanvas);
      chartSection.appendChild(progH3);
      chartSection.appendChild(progCanvas);

      // Options
      const optionsDiv = document.createElement('div');
      optionsDiv.classList.add('goal-options');
      goal.options.forEach((opt) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(opt));
        optionsDiv.appendChild(label);
      });

      // Checklist (if any)
      if (goal.checklist) {
        const checklistDiv = document.createElement('div');
        checklistDiv.classList.add('checklist');
        const h4 = document.createElement('h4');
        h4.textContent = 'Checklist:';
        checklistDiv.appendChild(h4);

        const ul = document.createElement('ul');
        goal.checklist.forEach((item) => {
          const li = document.createElement('li');
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = item.done || false;

          const label = document.createElement('label');
          label.textContent = item.label;

          li.appendChild(cb);
          li.appendChild(label);
          ul.appendChild(li);
        });
        checklistDiv.appendChild(ul);

        body.appendChild(checklistDiv);
      }

      // Advisor chat
      const advisorDiv = document.createElement('div');
      advisorDiv.classList.add('advisor-chat');
      const advisorLabel = document.createElement('label');
      advisorLabel.innerHTML = `<strong>Ask Your Advisor / AI:</strong>`;
      const advisorTextarea = document.createElement('textarea');
      advisorTextarea.placeholder = goal.advisorPrompt || "Type your question...";
      const advisorButton = document.createElement('button');
      advisorButton.textContent = 'Send';

      advisorDiv.appendChild(advisorLabel);
      advisorDiv.appendChild(advisorTextarea);
      advisorDiv.appendChild(advisorButton);

      // Append elements
      header.appendChild(title);
      header.appendChild(toggleIcon);
      body.appendChild(targetP);
      body.appendChild(milestonesP);
      body.appendChild(chartSection);
      body.appendChild(optionsDiv);
      body.appendChild(advisorDiv);

      card.appendChild(header);
      card.appendChild(body);
      goalsContainer.appendChild(card);

      // Toggle logic
      header.addEventListener('click', () => {
        if (body.style.display === 'none') {
          body.style.display = 'block';
          toggleIcon.classList.add('rotate');
        } else {
          body.style.display = 'none';
          toggleIcon.classList.remove('rotate');
        }
      });
    });

    // Once the DOM elements for each canvas are in place, draw the charts:
    drawAllCharts();
  } catch (error) {
    console.error('Error loading goals:', error);
  }
}

/***********************************************************
 * BUILD CALENDAR FROM JSON
 ************************************************************/
async function loadCalendar() {
  try {
    const res = await fetch('data/calendar.json');
    const data = await res.json();
    const calendarContainer = document.getElementById('calendarContainer');

    // For each event, create a card
    const monthTitle = document.createElement('h2');
    monthTitle.textContent = data.monthLabel || 'Current Month';
    calendarContainer.appendChild(monthTitle);

    data.events.forEach((evt) => {
      const card = document.createElement('div');
      card.classList.add('card');

      // Header
      const header = document.createElement('div');
      header.classList.add('card-header');
      const title = document.createElement('h2');
      title.textContent = evt.name;
      header.appendChild(title);

      // Body
      const body = document.createElement('div');
      body.classList.add('card-body');
      const dateP = document.createElement('p');
      dateP.innerHTML = `<strong>Date:</strong> ${evt.date}`;

      body.appendChild(dateP);
      card.appendChild(header);
      card.appendChild(body);

      calendarContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading calendar:', error);
  }
}

/***********************************************************
 * BUILD PLAN ITEMS FROM JSON
 ************************************************************/
async function loadPlan() {
  try {
    const res = await fetch('data/plan.json');
    const data = await res.json();
    const planContainer = document.getElementById('planContainer');

    data.plans.forEach((item) => {
      // Each plan item in a card
      const card = document.createElement('div');
      card.classList.add('card');

      // Header
      const header = document.createElement('div');
      header.classList.add('card-header');
      const title = document.createElement('h2');
      title.textContent = item.goalName;
      header.appendChild(title);

      // Body
      const body = document.createElement('div');
      body.classList.add('card-body');
      const progressP = document.createElement('p');
      progressP.innerHTML = `
        <strong>Progress:</strong> ${item.progress}% 
      `;
      // Progress bar
      const progressEl = document.createElement('progress');
      progressEl.value = item.progress;
      progressEl.max = 100;

      body.appendChild(progressP);
      body.appendChild(progressEl);
      card.appendChild(header);
      card.appendChild(body);

      planContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading plan:', error);
  }
}

/***********************************************************
 * BUILD MONEY OVERVIEW FROM JSON
 ************************************************************/
async function loadMoney() {
  try {
    const res = await fetch('data/money.json');
    const data = await res.json();
    const moneyContainer = document.getElementById('moneyContainer');

    // Bank
    const bankCard = document.createElement('div');
    bankCard.classList.add('card');

    const bankHeader = document.createElement('div');
    bankHeader.classList.add('card-header');
    const bankTitle = document.createElement('h2');
    bankTitle.textContent = 'Bank Account Balance';

    bankHeader.appendChild(bankTitle);

    const bankBody = document.createElement('div');
    bankBody.classList.add('card-body');
    const bankBalance = document.createElement('p');
    bankBalance.innerHTML = `$${data.balances.bank.toLocaleString()}`;

    bankBody.appendChild(bankBalance);
    bankCard.appendChild(bankHeader);
    bankCard.appendChild(bankBody);
    moneyContainer.appendChild(bankCard);

    // Investments
    const investCard = document.createElement('div');
    investCard.classList.add('card');

    const investHeader = document.createElement('div');
    investHeader.classList.add('card-header');
    const investTitle = document.createElement('h2');
    investTitle.textContent = 'Investments';

    investHeader.appendChild(investTitle);

    const investBody = document.createElement('div');
    investBody.classList.add('card-body');
    const investBalance = document.createElement('p');
    investBalance.innerHTML = `$${data.balances.investments.toLocaleString()}`;

    investBody.appendChild(investBalance);
    investCard.appendChild(investHeader);
    investCard.appendChild(investBody);
    moneyContainer.appendChild(investCard);
  } catch (error) {
    console.error('Error loading money data:', error);
  }
}

/***********************************************************
 * BUDGET PLANNING
 ************************************************************/
const calculateBudgetBtn = document.getElementById('calculateBudget');
if (calculateBudgetBtn) {
  calculateBudgetBtn.addEventListener('click', () => {
    const monthlyIncome = Number(document.getElementById('monthlyIncome').value);
    const monthlyExpenses = Number(document.getElementById('monthlyExpenses').value);
    const budgetResult = document.getElementById('budgetResult');

    if (!isNaN(monthlyIncome) && !isNaN(monthlyExpenses)) {
      const surplus = monthlyIncome - monthlyExpenses;
      if (surplus > 0) {
        budgetResult.textContent = `You have a surplus of $${surplus} per month.`;
      } else if (surplus < 0) {
        budgetResult.textContent = `You are over budget by $${Math.abs(surplus)} per month.`;
      } else {
        budgetResult.textContent = `You are breaking even. No surplus or deficit.`;
      }
    } else {
      budgetResult.textContent = `Please enter valid income and expenses.`;
    }
  });
}

/***********************************************************
 * LIGHT / DARK MODE
 ************************************************************/
const darkModeCheckbox = document.getElementById('darkMode');
if (darkModeCheckbox) {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    darkModeCheckbox.checked = false;
  } else {
    // Default is dark mode
    darkModeCheckbox.checked = true;
  }

  darkModeCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      // Dark mode
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      drawAllCharts();
    } else {
      // Light mode
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      drawAllCharts();
    }
  });
}

/***********************************************************
 * SIMPLE CHARTS (PERFORMANCE & PROGRESS)
 ************************************************************/
function drawSimpleChart(canvasId, title) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  // Clear area
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Detect light/dark for styling
  const isLightMode = document.body.classList.contains('light-mode');
  const textColor = isLightMode ? '#111111' : '#ffffff';
  const lineColor = '#00ff7f';
  const gridColor = isLightMode ? '#888' : '#555';

  // Title
  ctx.fillStyle = textColor;
  ctx.font = '16px Inter';
  ctx.fillText(title, 40, 25);

  // Baseline
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, canvas.height - 30);
  ctx.lineTo(canvas.width - 20, canvas.height - 30);
  ctx.stroke();

  // Simple line
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, canvas.height - 50);
  ctx.lineTo(canvas.width / 2, canvas.height - 80);
  ctx.lineTo(canvas.width - 20, canvas.height - 100);
  ctx.stroke();
}

function drawAllCharts() {
  // Example IDs from goals.json
  drawSimpleChart('retirementPerfChart', 'Retirement Performance');
  drawSimpleChart('retirementProgChart', 'Retirement Progress');
  drawSimpleChart('housePerfChart', 'House Performance');
  drawSimpleChart('houseProgChart', 'House Progress');
  drawSimpleChart('kidsDancePerfChart', 'Kids Dance Performance');
  drawSimpleChart('kidsDanceProgChart', 'Kids Dance Progress');

  // If you added more goals with unique canvas IDs, add them here too
}

/***********************************************************
 * ON PAGE LOAD
 ************************************************************/
window.addEventListener('DOMContentLoaded', async () => {
  // Default page
  showPage('life');

  // Load data for each page
  await loadGoals();
  await loadCalendar();
  await loadPlan();
  await loadMoney();

  // Draw charts (in case any were not already drawn)
  drawAllCharts();
});