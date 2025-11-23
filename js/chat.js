// KFUPM Chatbot - Frontend for Vercel Deployment

// ============================================================================
// API CONFIGURATION - UPDATE THESE BEFORE DEPLOYING
// ============================================================================
const API_CONFIG = {
    // For local testing, use: 'http://localhost:5000'
    // For production, use your ngrok/cloudflare URL: 'https://abc123.ngrok.io'
    baseUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://precapitalistic-eldora-uninterpolative.ngrok-free.dev',
    
    // API key for authentication (must match backend)
    apiKey: 'kfupm-chatbot-secure-api-key-2024'
};

console.log('API Configuration:', API_CONFIG.baseUrl);

// ============================================================================
// CHATBOT CLASS
// ============================================================================

class ChatBot {
    constructor() {
        this.searchEnabled = false;
        this.isProcessing = false;
        this.currentSessionId = null;
        this.sessions = {};
        
        // DOM elements
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.searchToggle = document.getElementById('searchToggle');
        this.clearBtn = document.getElementById('clearBtn');
        this.charCount = document.getElementById('charCount');
        this.status = document.getElementById('status');
        this.loadingTemplate = document.getElementById('loadingTemplate');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.newSessionBtn = document.getElementById('newSessionBtn');
        this.sessionsList = document.getElementById('sessionsList');
        
        // Check if all required elements exist
        if (!this.chatContainer || !this.messageInput || !this.sendBtn) {
            console.error('Required DOM elements not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Load sessions from localStorage
        this.loadSessionsFromStorage();
        
        // Create initial session if none exists
        if (Object.keys(this.sessions).length === 0) {
            this.createNewSession();
        } else {
            // Load the most recent session
            const sessionIds = Object.keys(this.sessions);
            this.switchSession(sessionIds[sessionIds.length - 1]);
        }
        
        // Event listeners
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => this.updateCharCount());
        if (this.searchToggle) this.searchToggle.addEventListener('click', () => this.toggleSearch());
        if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearCurrentSession());
        if (this.sidebarToggle) this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        if (this.newSessionBtn) this.newSessionBtn.addEventListener('click', () => this.createNewSession());
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResize());
        
        // Initial state
        this.updateCharCount();
        this.renderSessions();
        this.messageInput.focus();
        
        console.log('KFUPM Chatbot initialized with sessions');
    }
    
    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('hidden');
        }
    }
    
    // Session Management
    createNewSession() {
        const sessionId = Date.now().toString();
        const timestamp = new Date();
        
        this.sessions[sessionId] = {
            id: sessionId,
            title: 'New Conversation',
            messages: [],
            createdAt: timestamp.toISOString(),
            updatedAt: timestamp.toISOString()
        };
        
        this.saveSessionsToStorage();
        this.switchSession(sessionId);
        this.renderSessions();
    }
    
    switchSession(sessionId) {
        this.currentSessionId = sessionId;
        const session = this.sessions[sessionId];
        
        if (!session) return;
        
        // Clear chat container
        this.chatContainer.innerHTML = '';
        
        // Load messages from session
        if (session.messages.length === 0) {
            this.showWelcomeMessage();
        } else {
            session.messages.forEach(msg => {
                this.addMessage(msg.role, msg.content, msg.sources || [], false, false);
            });
        }
        
        this.renderSessions();
        this.messageInput.focus();
    }
    
    deleteSession(sessionId) {
        if (!confirm('Delete this conversation?')) return;
        
        delete this.sessions[sessionId];
        this.saveSessionsToStorage();
        
        // If deleting current session, switch to another or create new
        if (sessionId === this.currentSessionId) {
            const remainingSessions = Object.keys(this.sessions);
            if (remainingSessions.length > 0) {
                this.switchSession(remainingSessions[remainingSessions.length - 1]);
            } else {
                this.createNewSession();
            }
        }
        
        this.renderSessions();
    }
    
    clearCurrentSession() {
        if (!confirm('Clear this conversation?')) return;
        
        const session = this.sessions[this.currentSessionId];
        if (session) {
            session.messages = [];
            session.title = 'New Conversation';
            this.saveSessionsToStorage();
        }
        
        this.chatContainer.innerHTML = '';
        this.showWelcomeMessage();
        this.renderSessions();
    }
    
    renderSessions() {
        if (!this.sessionsList) return;
        
        this.sessionsList.innerHTML = '';
        
        const sessionIds = Object.keys(this.sessions).reverse(); // Most recent first
        
        sessionIds.forEach(sessionId => {
            const session = this.sessions[sessionId];
            const sessionDiv = document.createElement('div');
            sessionDiv.className = `session-item ${sessionId === this.currentSessionId ? 'active' : ''}`;
            
            const sessionInfo = document.createElement('div');
            sessionInfo.className = 'session-info';
            
            const title = document.createElement('div');
            title.className = 'session-title';
            title.textContent = session.title;
            
            const time = document.createElement('div');
            time.className = 'session-time';
            const date = new Date(session.updatedAt);
            time.textContent = this.formatSessionTime(date);
            
            sessionInfo.appendChild(title);
            sessionInfo.appendChild(time);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'session-delete';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteSession(sessionId);
            };
            
            sessionDiv.appendChild(sessionInfo);
            sessionDiv.appendChild(deleteBtn);
            
            sessionDiv.onclick = () => this.switchSession(sessionId);
            
            this.sessionsList.appendChild(sessionDiv);
        });
    }
    
    formatSessionTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    
    loadSessionsFromStorage() {
        const stored = localStorage.getItem('kfupm_sessions');
        if (stored) {
            try {
                this.sessions = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load sessions:', e);
                this.sessions = {};
            }
        }
    }
    
    saveSessionsToStorage() {
        try {
            localStorage.setItem('kfupm_sessions', JSON.stringify(this.sessions));
        } catch (e) {
            console.error('Failed to save sessions:', e);
        }
    }
    
    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className ='welcome-message fade-in';
        welcomeDiv.innerHTML = `
            <h2>مرحباً! Welcome to KFUPM 👋</h2>
            <p>I'm your AI assistant for King Fahd University of Petroleum & Minerals.</p>
            <p>Ask me about:</p>
            <ul>
                <li>📚 Academic programs and courses</li>
                <li>📝 Admission requirements</li>
                <li>🏛️ Campus facilities and services</li>
                <li>🔬 Research opportunities</li>
                <li>ℹ️ General KFUPM information</li>
            </ul>
            <p class="tip">💡 <strong>Tip:</strong> Toggle "Web Search" ON to get real-time information from KFUPM website!</p>
        `;
        this.chatContainer.appendChild(welcomeDiv);
    }
    
    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = `${count} / 2000`;
        
        if (count > 1900) {
            this.charCount.style.color = '#e74c3c';
        } else {
            this.charCount.style.color = '#7f8c8d';
        }
    }
    
    toggleSearch() {
        this.searchEnabled = !this.searchEnabled;
        const statusSpan = this.searchToggle.querySelector('.toggle-status');
        
        if (this.searchEnabled) {
            this.searchToggle.classList.add('active');
            statusSpan.textContent = 'ON';
        } else {
            this.searchToggle.classList.remove('active');
            statusSpan.textContent = 'OFF';
        }
        
        console.log(`Search ${this.searchEnabled ? 'enabled' : 'disabled'}`);
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isProcessing) return;
        
        if (message.length > 2000) {
            this.showStatus('Message too long (max 2000 characters)', 'error');
            return;
        }
        
        // Clear input
        this.messageInput.value = '';
        this.autoResize();
        this.updateCharCount();
        
        // Remove welcome message if present
        const welcomeMsg = this.chatContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        // Add user message
        this.addMessage('user', message, [], false, true);
        
        // Show loading indicator
        const loadingMsg = this.addLoadingMessage();
        
        // Disable input
        this.setProcessing(true);
        this.showStatus('Processing...', '');
        
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': API_CONFIG.apiKey
                },
                body: JSON.stringify({
                    message: message,
                    use_search: this.searchEnabled
                })
            });
            
            loadingMsg.remove();
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Server error');
            }
            
            const data = await response.json();
            
            // Add assistant response with typing effect
            this.addMessage('assistant', data.reply, data.sources, true, true);
            
            // Update session title if it's still "New Conversation"
            if (this.sessions[this.currentSessionId].title === 'New Conversation') {
                this.sessions[this.currentSessionId].title = message.substring(0, 50);
                this.renderSessions();
            }
            
            // Update session timestamp
            this.sessions[this.currentSessionId].updatedAt = new Date().toISOString();
            this.saveSessionsToStorage();
            
            this.showStatus('', '');
            
        } catch (error) {
            console.error('Error:', error);
            loadingMsg.remove();
            this.addErrorMessage(error.message || 'Failed to get response. Make sure the backend server is running.');
            this.showStatus('Error occurred', 'error');
        } finally {
            this.setProcessing(false);
            this.messageInput.focus();
        }
    }
    
    addMessage(role, content, sources = [], useTyping = false, saveToSession = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message fade-in`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        contentDiv.appendChild(textDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        this.chatContainer.appendChild(messageDiv);
        
        // Store message ID for feedback
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        messageDiv.dataset.messageId = messageId;
        
        // Instant display with proper markdown rendering
        if (role === 'assistant') {
            this.renderMarkdown(textDiv, content);
            this.addFeedback(contentDiv, messageId, content);
        } else {
            textDiv.textContent = content;
        }
        this.addSources(contentDiv, sources);
        this.addTimestamp(contentDiv);
        
        if (saveToSession) {
            this.saveMessageToSession(role, content, sources);
        }
        
        this.scrollToBottom();
    }
    
    renderMarkdown(element, text) {
        // Simple markdown parser for common patterns
        let html = text;
        
        // Headers
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');
        
        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        
        // Inline code
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        
        // Lists
        html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // Wrap consecutive list items in ul
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
        
        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>(<[huo])/g, '$1');
        html = html.replace(/(<\/[huo][^>]*>)<\/p>/g, '$1');
        
        element.innerHTML = html;
    }
    
    addFeedback(contentDiv, messageId, assistantMessage) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'message-feedback';
        feedbackDiv.innerHTML = `
            <button class="feedback-btn" data-rating="1" title="Helpful">
                <span class="feedback-icon">👍</span>
                <span class="feedback-count">0</span>
            </button>
            <button class="feedback-btn" data-rating="-1" title="Not helpful">
                <span class="feedback-icon">👎</span>
                <span class="feedback-count">0</span>
            </button>
        `;
        
        // Add click handlers
        feedbackDiv.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', () => this.submitFeedback(messageId, btn.dataset.rating, assistantMessage));
        });
        
        contentDiv.appendChild(feedbackDiv);
    }
    
    async submitFeedback(messageId, rating, assistantMessage) {
        try {
            // Get the user message (previous message in chat)
            const messages = this.sessions[this.currentSessionId].messages;
            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            
            const response = await fetch(`${API_CONFIG.baseUrl}/feedback`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': API_CONFIG.apiKey
                },
                body: JSON.stringify({
                    message_id: messageId,
                    rating: parseInt(rating),
                    user_message: lastUserMessage ? lastUserMessage.content : '',
                    assistant_message: assistantMessage,
                    session_id: this.currentSessionId
                })
            });
            
            if (response.ok) {
                // Visual feedback
                const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageDiv) {
                    const btn = messageDiv.querySelector(`.feedback-btn[data-rating="${rating}"]`);
                    if (btn) {
                        btn.classList.add('active');
                        btn.disabled = true;
                        // Disable the other button
                        messageDiv.querySelectorAll('.feedback-btn').forEach(b => {
                            if (b !== btn) b.disabled = true;
                        });
                    }
                }
                console.log('Feedback submitted successfully');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    }
    
    addSources(contentDiv, sources) {
        if (sources && sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'sources fade-in';
            
            const title = document.createElement('div');
            title.className = 'sources-title';
            title.textContent = '📚 Sources:';
            sourcesDiv.appendChild(title);
            
            const gridDiv = document.createElement('div');
            gridDiv.className = 'sources-grid';
            
            sources.forEach((source, index) => {
                const sourceItem = document.createElement('div');
                sourceItem.className = 'source-item';
                
                const link = document.createElement('a');
                link.href = source.url;
                link.target = '_blank';
                link.title = source.title;
                link.textContent = `${index + 1}. ${source.title}`;
                sourceItem.appendChild(link);
                
                gridDiv.appendChild(sourceItem);
            });
            
            sourcesDiv.appendChild(gridDiv);
            contentDiv.appendChild(sourcesDiv);
        }
    }
    
    addTimestamp(contentDiv) {
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        contentDiv.appendChild(time);
    }
    
    typeText(element, text, callback) {
        let index = 0;
        const speed = 8; // milliseconds per character (faster)
        
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                this.scrollToBottom();
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        };
        
        type();
    }
    
    saveMessageToSession(role, content, sources = []) {
        if (!this.currentSessionId) return;
        
        const session = this.sessions[this.currentSessionId];
        if (session) {
            session.messages.push({
                role,
                content,
                sources,
                timestamp: new Date().toISOString()
            });
            session.updatedAt = new Date().toISOString();
            this.saveSessionsToStorage();
        }
    }
    
    addLoadingMessage() {
        const loadingMsg = this.loadingTemplate.content.cloneNode(true).firstElementChild;
        this.chatContainer.appendChild(loadingMsg);
        this.scrollToBottom();
        return this.chatContainer.lastElementChild;
    }
    
    addErrorMessage(errorText) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message fade-in';
        errorDiv.innerHTML = `
            <strong>⚠️ Error:</strong> ${errorText}
            <div style="margin-top: 8px; font-size: 12px;">
                Please try again or contact support if the issue persists.
            </div>
        `;
        this.chatContainer.appendChild(errorDiv);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }
    
    setProcessing(processing) {
        this.isProcessing = processing;
        this.sendBtn.disabled = processing;
        this.messageInput.disabled = processing;
        if (this.searchToggle) this.searchToggle.disabled = processing;
        if (this.clearBtn) this.clearBtn.disabled = processing;
    }
    
    showStatus(message, type = '') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new ChatBot();
});