/***********************************************************
 * PAGE & NAV LOGIC (RIA + old screens)
 ************************************************************/
function showPage(pageId) {
  // Hide all <section> pages
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  // Show the requested one
  document.getElementById(pageId).classList.add('active');
  // Close the side menu if open
  document.getElementById('sideMenu').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // Side Menu
  const menuToggle = document.getElementById('menuToggle');
  const closeMenu = document.getElementById('closeMenu');
  const sideMenu = document.getElementById('sideMenu');
  menuToggle.addEventListener('click', () => sideMenu.classList.add('open'));
  closeMenu.addEventListener('click', () => sideMenu.classList.remove('open'));

  // Slide-out Chat
  const chatToggle = document.getElementById('chatToggle');
  const chatOverlay = document.getElementById('chatOverlay');
  const closeChat = document.getElementById('closeChat');
  const sendChat = document.getElementById('sendChat');
  const chatMessageInput = document.getElementById('chatMessage');
  const chatTabButtons = document.querySelectorAll('.chat-tab-button');
  const chatHistories = document.querySelectorAll('.chat-history');

  chatToggle.addEventListener('click', () => chatOverlay.classList.add('open'));
  closeChat.addEventListener('click', () => chatOverlay.classList.remove('open'));

  // Chat tabs
  chatTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chatTabButtons.forEach(b => b.classList.remove('active'));
      chatHistories.forEach(h => h.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-chat-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Send chat message
  sendChat.addEventListener('click', () => {
    const msg = chatMessageInput.value.trim();
    if (!msg) return;
    const activeHist = document.querySelector('.chat-history.active');
    if (!activeHist) return;

    const newMsg = document.createElement('div');
    newMsg.className = 'chat-message';
    newMsg.textContent = msg;
    activeHist.appendChild(newMsg);

    chatMessageInput.value = '';
    activeHist.scrollTop = activeHist.scrollHeight;
  });

  // RIA Cards (expand + overlay)
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    // Expand/collapse
    const chevronLeft = card.querySelector('.chevron-area-left');
    if (chevronLeft) {
      chevronLeft.addEventListener('click', (evt) => {
        evt.stopPropagation();
        card.classList.toggle('expanded');
      });
    }
    // "Details" or "Generate" => open overlay
    const basketBtn = card.querySelector('.card-basket-button');
    if (basketBtn) {
      basketBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        const itemKey = basketBtn.getAttribute('data-basket-id');
        openOverlay(itemKey);
      });
    }
  });

  // Show default RIA page on load
  showPage('businessPage');

  // BUDGET calculation from old code
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

  // Toggling your old goal cards (Retirement, House, etc.)
});

/***********************************************************
 * Old toggleCard function (for the .goal-card areas)
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
 * SIMPLE CHARTS (From old code; optional)
 ************************************************************/
function drawSimpleChart(canvasId, title) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const textColor = '#fff';
  const lineColor = '#2c7';
  const gridColor = '#555';

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

/** If you want to auto-draw them on page load, call drawAllCharts(). */
function drawAllCharts() {
  drawSimpleChart('retirementPerfChart', 'Retirement Performance');
  drawSimpleChart('retirementProgChart', 'Retirement Progress');
  drawSimpleChart('housePerfChart', 'House Performance');
  drawSimpleChart('houseProgChart', 'House Progress');
  drawSimpleChart('kidsDancePerfChart', 'Kids Dance Performance');
  drawSimpleChart('kidsDanceProgChart', 'Kids Dance Progress');
}

/***********************************************************
 * FULL-PAGE OVERLAY DATA & LOGIC (RIA)
 ************************************************************/
const bottomSheetData = {
  // business
  bizNetFlow: {
    title: "Business - Net Inflow/Outflow",
    hasTabs: false,
    body: `<h2>Month-to-Date Cashflow</h2><p>Inflow: $120,000<br>Outflow: $45,000<br>Net: +$75,000</p>`,
    suggestedPrompts: [
      "Which accounts had the largest inflows?",
      "Any unusual outflows this month?",
      "Forecast next month's net flow."
    ]
  },
  // markets
  mktSP500: {
    title: "Markets - S&P 500",
    hasTabs: false,
    body: `<h2>Index Overview</h2><p>S&P 500 is up 1.5% today. Possibly show chart data or sector breakdown.</p>`,
    suggestedPrompts: ["Which sector is leading gains?", "Compare to last week", "Any big large-cap movers?"]
  },
  mktDJIA: {
    title: "Markets - DJIA",
    hasTabs: false,
    body: `<h2>DJIA Interactive Grid</h2><p>Placeholder for major components or mini-charts. (demo)</p>`,
    suggestedPrompts: ["Which Dow components are up or down?", "Historical Dow performance?", "Any earnings news?"]
  },
  mktNASDAQ: {
    title: "Markets - NASDAQ",
    hasTabs: false,
    body: `<h2>NASDAQ Interactive Grid</h2><p>Placeholder for top movers, chart, or dynamic quotes. (demo)</p>`,
    suggestedPrompts: ["Any big tech stocks leading gains?", "Check daily volume", "Compare QQQ vs. index"]
  },
  mktRussell2k: {
    title: "Markets - Russell 2000",
    hasTabs: false,
    body: `<h2>Russell 2000 Interactive Grid</h2><p>Placeholder for small-cap data or mini-charts. (demo)</p>`,
    suggestedPrompts: ["Top small-cap movers?", "Underperforming large-cap?", "Sector tilt?"]
  },
  mktFTSE100: {
    title: "Markets - FTSE 100",
    hasTabs: false,
    body: `<h2>FTSE 100 Interactive Grid</h2><p>Placeholder for UK market data or chart. (demo)</p>`,
    suggestedPrompts: ["Check major UK stocks", "Compare FTSE vs. Europe", "Impacts of currency?"]
  },
  mktNikkei225: {
    title: "Markets - Nikkei 225",
    hasTabs: false,
    body: `<h2>Nikkei 225 Interactive Grid</h2><p>Placeholder for Japanese market data. (demo)</p>`,
    suggestedPrompts: ["Which sectors lead Nikkei?", "Any BoJ news?", "Compare Nikkei to yen movement"]
  },
  mkt10YrTreasury: {
    title: "Markets - 10-Year Treasury",
    hasTabs: false,
    body: `<h2>10-Year Treasury Interactive Grid</h2><p>Placeholder for yield charts or real-time bond rates. (demo)</p>`,
    suggestedPrompts: ["Check historical yield", "2-year vs. 10-year spread?", "Yield curve inversion?"]
  },
  // portfolio
  portAUM: {
    title: "Portfolio - Total AUM",
    hasTabs: false,
    body: `<h2>Total AUM: +0.8%</h2><p>We are up +0.8% today. Possibly break out returns by client or asset class.</p>`,
    suggestedPrompts: ["Which clients contributed most growth?", "Any big allocation shifts?", "Predict tomorrow?"]
  },
  // management
  mgtDriftEvent: {
    title: "Drift Event - Orders & AI",
    hasTabs: true,
    tab1: `
      <h2>Summary Info</h2>
      <p>10 drifted accounts, avg drift +4%. Potential rebal range: 2-3%. (demo)</p>
    `,
    tab2: `
      <h2>Orders Created</h2>
      <table style="width:100%; margin-bottom:1rem;">
        <thead><tr><th>Symbol</th><th>Action</th><th>Amount</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>AAPL</td><td>Sell</td><td>$5,000</td><td>Reduce overweight</td></tr>
          <tr><td>VTI</td><td>Buy</td><td>$3,000</td><td>Core index</td></tr>
        </tbody>
      </table>
      <h3>AI Insights</h3>
      <p>AI might rotate into Healthcare. (demo)</p>
    `,
    suggestedPrompts: ["Which accounts have highest drift?", "Cost of rebalancing?", "Alternative orders?"]
  },
  mgtNewAccounts: {
    title: "New Accounts (5) - Orders & AI",
    hasTabs: true,
    tab1: `<h2>Summary Info</h2><p>5 new accounts. Possibly show status or docs needed. (demo)</p>`,
    tab2: `<h2>Orders & AI</h2><p>No specific orders yet. AI can suggest allocations or templates. (demo)</p>`,
    suggestedPrompts: ["Which new accounts are funded?", "Suggest default allocation?", "Any missing docs?"]
  }
};

/** Show overlay data (similar to RIA snippet). */
function openOverlay(itemKey) {
  const sheet = document.getElementById('fullPageOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayContent = document.getElementById('overlayContent');
  const overlayTabBar = document.getElementById('overlayTabBar');
  const overlayAiMessages = document.getElementById('overlayAiMessages');
  const overlayAiSuggestions = document.getElementById('overlayAiSuggestions');

  // reset
  overlayTitle.textContent = '';
  overlayContent.innerHTML = '';
  overlayTabBar.style.display = 'none';
  if (overlayAiMessages) overlayAiMessages.innerHTML = '';
  if (overlayAiSuggestions) overlayAiSuggestions.innerHTML = '';

  const data = bottomSheetData[itemKey] || { title:"Unknown", body:"No data found.", suggestedPrompts:[] };
  overlayTitle.textContent = data.title;

  if (data.hasTabs) {
    overlayTabBar.style.display = 'flex';
    overlayContent.innerHTML = `
      <div class="overlay-tab-content active" id="overlayTab1">${data.tab1 || ''}</div>
      <div class="overlay-tab-content" id="overlayTab2">${data.tab2 || ''}</div>
    `;
    setupOverlayTabHandlers();
  } else {
    overlayContent.innerHTML = data.body || '';
  }

  // AI suggestions
  if (data.suggestedPrompts && data.suggestedPrompts.length) {
    const suggestionHTML = `
      <strong>Suggested Prompts:</strong>
      <ul style="margin:0.5rem 0; padding-left:1.5rem;">
        ${data.suggestedPrompts.map(
          p => `<li onclick="overlayAiInputPrompt('${p}')">${p}</li>`
        ).join('')}
      </ul>
    `;
    overlayAiSuggestions.innerHTML = suggestionHTML;
  }

  sheet.classList.add('open');
}
function closeOverlay() {
  document.getElementById('fullPageOverlay').classList.remove('open');
}
function setupOverlayTabHandlers() {
  const overlayTabBar = document.getElementById('overlayTabBar');
  const buttons = overlayTabBar.querySelectorAll('.overlay-tab-button');
  const tab1 = document.getElementById('overlayTab1');
  const tab2 = document.getElementById('overlayTab2');

  // Default tab
  buttons.forEach(b => b.classList.remove('active'));
  buttons[0].classList.add('active');
  tab1.classList.add('active');
  tab2.classList.remove('active');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // clear
      buttons.forEach(b => b.classList.remove('active'));
      tab1.classList.remove('active');
      tab2.classList.remove('active');
      // set
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-overlay-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

/***********************************************************
 * AI Chat in the Overlay
 ************************************************************/
function overlayAiInputPrompt(promptText) {
  const inputField = document.getElementById('overlayAiInput');
  if (inputField) {
    inputField.value = promptText;
    inputField.focus();
  }
}
function sendOverlayAiChat() {
  const inputField = document.getElementById('overlayAiInput');
  const msgContainer = document.getElementById('overlayAiMessages');
  if (!inputField || !msgContainer) return;

  const text = inputField.value.trim();
  if (!text) return;

  // User line
  const userDiv = document.createElement('div');
  userDiv.classList.add('ai-chat-line', 'user');
  userDiv.textContent = "You: " + text;
  msgContainer.appendChild(userDiv);

  inputField.value = '';
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Simulate AI response
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.classList.add('ai-chat-line', 'bot');
    botDiv.textContent = `AI Bot: Considering "${text}"... (demo)`;
    msgContainer.appendChild(botDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, 800);
}