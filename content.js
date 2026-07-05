let saveBtn = null;

document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();


  if (saveBtn && !saveBtn.contains(e.target)) {
    saveBtn.remove();
    saveBtn = null;
  }

  if (text.length > 0) {

    setTimeout(() => {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Create button
      saveBtn = document.createElement('div');
      saveBtn.id = 'highlight-saver-btn';
      saveBtn.textContent = 'Save Highlight?';

      // Position it near the selection 
      saveBtn.style.top = `${rect.bottom + window.scrollY + 5}px`;
      saveBtn.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;

      saveBtn.addEventListener('mousedown', (ev) => {
       
        ev.preventDefault();
      });

      saveBtn.addEventListener('click', () => {
        saveHighlight(text, window.location.href, window.document.title);
      });

      document.body.appendChild(saveBtn);
    }, 10);
  }
});

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection.toString().trim().length === 0 && saveBtn) {
    saveBtn.remove();
    saveBtn = null;
  }
});

function saveHighlight(text, url, title) {
  if (saveBtn) {
    saveBtn.textContent = 'Saving...';
    saveBtn.style.pointerEvents = 'none';
  }

  const highlightInfo = {
    id: Date.now().toString(),
    text: text,
    url: url,
    title: title,
    date: new Date().toISOString()
  };

  chrome.storage.local.get(['savedHighlights'], (result) => {
    const highlights = result.savedHighlights || [];
    highlights.push(highlightInfo);

    chrome.storage.local.set({ savedHighlights: highlights }, () => {
      if (saveBtn) {
        saveBtn.textContent = 'Saved!';
        saveBtn.classList.add('success');
        
        // Remove button after delay
        setTimeout(() => {
          if (saveBtn) {
            saveBtn.remove();
            saveBtn = null;
          }
          // Also clear the selection
          window.getSelection().removeAllRanges();
        }, 1500);
      }
    });
  });
}
