async function loadMoney() {
  const res = await fetch('data/money.json');
  const data = await res.json();
  const container = document.getElementById('moneyContainer');
  container.innerHTML = '';

  (data.moneySections || []).forEach((section) => {
    // map IDs to actual account objects
    const realAccounts = (section.accountIds || []).map(id => accountsMap[id]).filter(Boolean);

    const summary = `<p><strong>Total:</strong> $${section.total.toLocaleString()}</p>`;

    // pass "accounts: realAccounts" to the card's overlay options
    const card = createCollapsibleCard(
      `money-${section.id}`,         // a unique ID for performance map
      section.title,
      summary,
      {
        bodyHtml: summary,
        accounts: realAccounts,      // <-- IMPORTANT
        photos: section.photos || []
      }
    );
    container.appendChild(card);
  });
}