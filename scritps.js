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

    // Additional logic to display/store the new goal can go here

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

 * TOGGLE CARD BODY

 ************************************************************/

function toggleCard(bodyId) {

  const body = document.getElementById(bodyId);

  const toggleIcon = body.parentElement.querySelector('.toggle-button');

  if (body.style.display === 'none') {

    body.style.display = 'block';

    toggleIcon.classList.add('rotate');

  } else {

    body.style.display = 'none';

    toggleIcon.classList.remove('rotate');

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

    darkModeCheckbox.checked = true; // default dark

  }

  darkModeCheckbox.addEventListener('change', (e) => {

    if (e.target.checked) {

      // Dark mode

      document.body.classList.remove('light-mode');

      localStorage.setItem('theme', 'dark');

      // Re-draw charts

      drawAllCharts();

    } else {

      // Light mode

      document.body.classList.add('light-mode');

      localStorage.setItem('theme', 'light');

      // Re-draw charts

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

  // Simple “line”

  ctx.strokeStyle = lineColor;

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(40, canvas.height - 50);

  ctx.lineTo(canvas.width / 2, canvas.height - 80);

  ctx.lineTo(canvas.width - 20, canvas.height - 100);

  ctx.stroke();

}

// Draw all charts for each goal

function drawAllCharts() {

  drawSimpleChart('retirementPerfChart', 'Retirement Performance');

  drawSimpleChart('retirementProgChart', 'Retirement Progress');

  drawSimpleChart('housePerfChart', 'House Performance');

  drawSimpleChart('houseProgChart', 'House Progress');

  drawSimpleChart('kidsDancePerfChart', 'Kids Dance Performance');

  drawSimpleChart('kidsDanceProgChart', 'Kids Dance Progress');

}

// Init

window.addEventListener('DOMContentLoaded', () => {

  // Default page

  showPage('life');

  // Draw charts initially

  drawAllCharts();

});