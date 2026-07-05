document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('api-key');
  const saveBtn = document.getElementById('save-btn');
  const statusMsg = document.getElementById('status-msg');

  // Load existing key
  const { openai_api_key } = await chrome.storage.local.get(['openai_api_key']);
  if (openai_api_key) {
    apiKeyInput.value = openai_api_key;
  }

  saveBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    
    try {
      if (!key) {
        await chrome.storage.local.remove('openai_api_key');
        statusMsg.textContent = 'API Key cleared.';
      } else {
        await chrome.storage.local.set({ openai_api_key: key });
        statusMsg.textContent = 'Settings saved successfully!';
      }
      
      statusMsg.className = 'success';
    } catch (err) {
      statusMsg.textContent = 'Failed to save settings.';
      statusMsg.className = 'error';
    }

    setTimeout(() => {
      statusMsg.textContent = '';
      statusMsg.className = '';
    }, 3000);
  });
});
