/**
 * chat.js
 * Handles the AI Guide chat interface, local storage of API settings,
 * and fetching from an OpenAI-compatible API to provide interactive explanations.
 */

const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const apiUrlInput = document.getElementById('api-url');
const apiKeyInput = document.getElementById('api-key');
const apiModelInput = document.getElementById('api-model');
const settingsForm = document.getElementById('settings-form');

const floatingChatPanel = document.getElementById('floating-chat-panel');
const aiChatBtn = document.getElementById('ai-chat-btn');
const closeChatBtn = document.getElementById('close-chat');
const clearChatBtn = document.getElementById('clear-chat');

let knowledgeBase = ""; // Will store our knowledge text

// Load configuration from local .env file (if running locally)
async function loadEnvConfig() {
    try {
        const response = await fetch('.env');
        if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            lines.forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim().replace(/^["'](.*)["']$/, '$1'); // Strip quotes if any
                    // Always overwrite input fields if .env has values (Local .env overrides LocalStorage)
                    if (key === 'API_URL' && value) apiUrlInput.value = value;
                    if (key === 'API_KEY' && value) apiKeyInput.value = value;
                    if (key === 'API_MODEL' && value) apiModelInput.value = value;
                }
            });
            console.log("Loaded local .env config.");
        }
    } catch (e) {
        // Ignore, .env doesn't exist in production or fetch failed
    }
}

// Load configuration from LocalStorage
function loadConfig() {
    const savedUrl = localStorage.getItem('ai_api_url');
    const savedKey = localStorage.getItem('ai_api_key');
    const savedModel = localStorage.getItem('ai_api_model');
    if (savedUrl) apiUrlInput.value = savedUrl;
    if (savedKey) apiKeyInput.value = savedKey;
    if (savedModel) apiModelInput.value = savedModel;
}

// Save configuration to LocalStorage
function saveConfig() {
    localStorage.setItem('ai_api_url', apiUrlInput.value.trim());
    localStorage.setItem('ai_api_key', apiKeyInput.value.trim());
    localStorage.setItem('ai_api_model', apiModelInput.value.trim());
    settingsModal.style.display = 'none';
    addMessage('System', 'Settings saved successfully! You can now chat.');
}

// Fetch knowledge base content
async function loadKnowledgeBase() {
    try {
        const response = await fetch('data/knowledge.md');
        if (response.ok) {
            knowledgeBase = await response.text();
            console.log("AI Knowledge base loaded successfully.");
        } else {
            console.warn("Knowledge base file not found.");
        }
    } catch (e) {
        console.error("Failed to load knowledge base:", e);
    }
}

// Add a message to the chat UI
function addMessage(sender, text) {
    const msgDiv = document.createElement('div');
    // Assign specific classes based on sender for styling
    let cssClass = 'system-message';
    if (sender === 'User') cssClass = 'user-message';
    if (sender === 'AI') cssClass = 'ai-message';
    
    msgDiv.className = `chat-message ${cssClass}`;
    
    // Prefix User messages with '>'
    const prefix = sender === 'User' ? '> ' : (sender === 'AI' ? '[Guide] ' : '[System] ');
    msgDiv.textContent = `${prefix}${text}`;
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to bottom
}

// Send message to LLM via API
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Use the current values from the input fields (which were populated by either localStorage or .env)
    const apiUrl = apiUrlInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const apiModel = apiModelInput.value.trim() || 'deepseek-v4-flash';

    if (!apiKey) {
        addMessage('System', 'Please configure your API Key in the settings (gear icon) first.');
        settingsModal.style.display = 'block';
        return;
    }

    // Display user's message
    addMessage('User', text);
    chatInput.value = ''; // Clear input field
    
    // Add typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message ai-message typing';
    typingMsg.textContent = '[Guide] typing...';
    chatHistory.appendChild(typingMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        // Construct the System Prompt with the injected Knowledge Base
        const systemPrompt = `You are an expert museum guide for this 3D specimen display. 
You are enthusiastic, slightly humorous, and speak in a Minecraft-inspired tone.
Answer the user's questions about the specimen based strictly on the following Knowledge Base. 
Do not make up facts outside the knowledge base. Keep your answers concise and engaging.

--- KNOWLEDGE BASE ---
${knowledgeBase}`;

        // Prepare the API request
        const requestBody = {
            model: apiModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            max_tokens: 300,
            temperature: 0.7,
            stream: true // Enable streaming for typewriter effect
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Bearer token auth
            },
            body: JSON.stringify(requestBody)
        });

        // Remove typing indicator
        if (chatHistory.contains(typingMsg)) chatHistory.removeChild(typingMsg);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        // Create the message container for streaming
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message ai-message markdown-body';
        msgDiv.innerHTML = '<strong>[Guide]</strong> ';
        chatHistory.appendChild(msgDiv);

        // Process the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let rawContent = ''; // Accumulate the raw markdown

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.choices[0].delta && data.choices[0].delta.content) {
                            rawContent += data.choices[0].delta.content;
                            // Re-parse the entire accumulated markdown on each chunk
                            msgDiv.innerHTML = '<strong>[Guide]</strong> <br>' + marked.parse(rawContent);
                            chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll
                        }
                    } catch (e) {
                        // Ignore partial JSON parsing errors during stream
                    }
                }
            }
        }

    } catch (error) {
        // Handle and display errors gracefully
        if(chatHistory.contains(typingMsg)) chatHistory.removeChild(typingMsg);
        addMessage('System', `Connection failed: ${error.message}`);
    }
}

// Event Listeners for UI interaction
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

settingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
closeSettings.addEventListener('click', () => settingsModal.style.display = 'none');
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveConfig();
});

// Close settings modal if clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Floating Widget Logic
aiChatBtn.addEventListener('click', () => {
    floatingChatPanel.classList.toggle('hidden');
    if (!floatingChatPanel.classList.contains('hidden')) {
        chatInput.focus();
    }
});

closeChatBtn.addEventListener('click', () => {
    floatingChatPanel.classList.add('hidden');
});

clearChatBtn.addEventListener('click', () => {
    chatHistory.innerHTML = '';
    addMessage('AI', 'Chat cleared! How can I help you?');
});

// Initialization on load
document.addEventListener('DOMContentLoaded', async () => {
    await loadEnvConfig();
    loadConfig();
    loadKnowledgeBase();
    // Welcome message
    setTimeout(() => {
        addMessage('AI', 'Welcome! I am your AI Museum Guide. Ask me anything about this Happy Ghast specimen!');
    }, 500);
});
