document.addEventListener('DOMContentLoaded', async () => {
  const highlightsContainer = document.getElementById('highlights-container');
  const emptyState = document.getElementById('empty-state');
  
  // Settings Modal elements
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings');
  const saveApiKeyBtn = document.getElementById('save-api-key');
  const apiKeyInput = document.getElementById('api-key');
  const settingsStatus = document.getElementById('settings-status');

  // Load highlights
  await renderHighlights();

  // Settings Logic
  settingsBtn.addEventListener('click', async () => {
    const { openai_api_key } = await chrome.storage.local.get(['openai_api_key']);
    if (openai_api_key) {
      apiKeyInput.value = openai_api_key;
    }
    settingsModal.classList.remove('hidden');
    settingsStatus.textContent = '';
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  saveApiKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      // Allow clearing the key
      await chrome.storage.local.remove('openai_api_key');
      settingsStatus.textContent = 'API Key cleared.';
      settingsStatus.className = 'status-msg success';
    } else {
      await chrome.storage.local.set({ openai_api_key: key });
      settingsStatus.textContent = 'API Key saved successfully!';
      settingsStatus.className = 'status-msg success';
    }
    setTimeout(() => {
      settingsModal.classList.add('hidden');
    }, 1500);
  });

  async function renderHighlights() {
    const { savedHighlights } = await chrome.storage.local.get(['savedHighlights']);
    const highlights = savedHighlights || [];

    // Clear existing (except empty state)
    Array.from(highlightsContainer.children).forEach(child => {
      if (child.id !== 'empty-state') {
        child.remove();
      }
    });

    if (highlights.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    // Render from newest to oldest
    highlights.slice().reverse().forEach(hl => {
      const card = createHighlightCard(hl);
      highlightsContainer.appendChild(card);
    });
  }

  function createHighlightCard(highlight) {
    const card = document.createElement('div');
    card.className = 'highlight-card';
    card.dataset.id = highlight.id;

    const date = new Date(highlight.date).toLocaleDateString(undefined, { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });

    const host = new URL(highlight.url).hostname.replace(/^www\./, '');

    card.innerHTML = `
      <p class="highlight-text">${escapeHTML(highlight.text)}</p>
      <div class="highlight-meta">
        <a href="${highlight.url}" target="_blank" class="highlight-source" title="${highlight.title}">${host}</a>
        <span>${date}</span>
      </div>
      <div class="card-actions">
        <button class="action-btn summarize-btn" data-id="${highlight.id}">✨ Summarize</button>
        <button class="action-btn delete-btn" data-id="${highlight.id}">Delete</button>
      </div>
      <div class="summary-result" id="summary-${highlight.id}"></div>
    `;

    // Delete handler
    card.querySelector('.delete-btn').addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const { savedHighlights } = await chrome.storage.local.get(['savedHighlights']);
      const updated = (savedHighlights || []).filter(h => h.id !== id);
      await chrome.storage.local.set({ savedHighlights: updated });
      await renderHighlights();
    });

    // Summarize handler
    card.querySelector('.summarize-btn').addEventListener('click', async (e) => {
      const btn = e.target;
      const id = btn.dataset.id;
      const summaryDiv = document.getElementById(`summary-${id}`);
      
      const { openai_api_key } = await chrome.storage.local.get(['openai_api_key']);
      if (!openai_api_key) {
        settingsModal.classList.remove('hidden');
        settingsStatus.textContent = 'Please enter an OpenAI API key to summarize.';
        settingsStatus.className = 'status-msg error';
        return;
      }

      btn.textContent = '⏳ Summarizing...';
      btn.disabled = true;
      summaryDiv.style.display = 'block';
      summaryDiv.textContent = 'Generating summary...';

      try {
        const summary = await summarizeText(highlight.text, openai_api_key);
        summaryDiv.innerHTML = `<strong>Summary:</strong> ${escapeHTML(summary)}`;
        btn.textContent = '✨ Summarized';
        btn.style.opacity = '0.5';
      } catch (err) {
        summaryDiv.innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
        btn.textContent = '✨ Try Again';
        btn.disabled = false;
      }
    });

    return card;
  }

  async function summarizeText(text, apiKey) {
    const prompt = `Please provide a concise summary of the following highlighted text:\n\n"${text}"`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error?.message || 'Failed to fetch summary');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
