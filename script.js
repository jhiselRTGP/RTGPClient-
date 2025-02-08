function openDetailOverlay(goalId, titleText, bodyHtml, { 
  checklist = [], 
  attachments = [], 
  photos = [],
  accounts = []
} = {}) {
  overlayTitle.textContent = titleText;
  overlayBody.innerHTML = bodyHtml;

  // clear old items
  overlayChecklist.innerHTML = '';
  overlayAttachments.innerHTML = '';
  overlayPhotos.innerHTML = '';
  overlayChatHistory.innerHTML = '';

  // fill checklist
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

  // fill attachments
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

  // fill photos
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || 'Photo';
    overlayPhotos.appendChild(img);
  });

  // Create a header + grid of “account cards”
  if (accounts.length > 0) {
    const acctHeader = document.createElement('h3');
    acctHeader.textContent = 'Accounts in This Section';
    overlayBody.appendChild(acctHeader);

    // a container for the grid
    const acctGrid = document.createElement('div');
    acctGrid.classList.add('account-card-grid'); // For CSS styling

    accounts.forEach(acct => {
      const card = document.createElement('div');
      card.classList.add('account-card');

      // account name
      const nameDiv = document.createElement('div');
      nameDiv.classList.add('account-name');
      nameDiv.textContent = acct.name || 'Unnamed Account';

      // balance
      const balanceDiv = document.createElement('div');
      balanceDiv.classList.add('account-balance');
      balanceDiv.textContent = `$${acct.balance?.toLocaleString() ?? '0.00'}`;

      // last updated (optional)
      if (acct.lastUpdated) {
        const updatedDiv = document.createElement('div');
        updatedDiv.classList.add('account-updated');
        updatedDiv.textContent = `Updated: ${acct.lastUpdated}`;
        card.appendChild(updatedDiv);
      }

      card.appendChild(nameDiv);
      card.appendChild(balanceDiv);

      acctGrid.appendChild(card);
    });

    overlayBody.appendChild(acctGrid);
  }

  // show overlay
  detailOverlay.classList.add('open');

  // performance chart
  const points = performanceMap[goalId] || [];
  drawPerformanceChart('overlayPerformanceCanvas', points);
}