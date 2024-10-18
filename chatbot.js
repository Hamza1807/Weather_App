class WeatherChatbot {
    constructor() {
        // Hardcoded API Key (Replace with your actual key)
        this.apiKey = 'AIzaSyChSKd5KA8nEosDMSw8SFUj8j0xb9uxBoU'; 
        this.API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.initializeElements();
        this.initializeEventListeners();
        this.sendWelcomeMessage();
    }

    initializeElements() {
        this.chatToggle = document.getElementById('chat-toggle');
        this.chatWindow = document.getElementById('chat-window');
        this.chatInput = document.getElementById('chatInput');
        this.searchButton = document.getElementById('searchButton');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.chatAnswerArea = document.getElementById('chatAnswerArea');
        this.openText = document.querySelector('.open-chat');
        this.closeText = document.querySelector('.close-chat');
    }

    initializeEventListeners() {
        // Chat toggle functionality
        this.chatToggle.addEventListener('click', () => this.toggleChat());

        // Send message listeners
        this.searchButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.chatWindow.classList.toggle('active');
        this.openText.style.display = this.openText.style.display === 'none' ? 'block' : 'none';
        this.closeText.style.display = this.closeText.style.display === 'none' ? 'block' : 'none';
    }

    sendWelcomeMessage() {
        this.addMessageToChat('bot', 'Welcome! I\'m your weather assistant. You can ask me about:');
        this.addMessageToChat('bot', '• Current weather conditions\n• Weather forecasts\n• Temperature conversions\n• Weather-related advice');
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message and clear input
        this.addMessageToChat('user', message);
        this.chatInput.value = '';

        // Show typing indicator
        this.typingIndicator.style.display = 'block';

        try {
            const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a weather assistant. Help with this question: ${message}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                const botResponse = data.candidates[0].content.parts[0].text;
                this.addMessageToChat('bot', botResponse);
            } else {
                throw new Error(data.error?.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error:', error);
            this.addMessageToChat('bot', 'Sorry, I encountered an error. Please check your connection and try again.');
        } finally {
            this.typingIndicator.style.display = 'none';
        }
    }

    addMessageToChat(role, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        
        // Convert URLs to clickable links
        const messageWithLinks = message.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank">$1</a>'
        );
        
        messageDiv.innerHTML = messageWithLinks;
        this.chatAnswerArea.appendChild(messageDiv);
        this.chatAnswerArea.scrollTop = this.chatAnswerArea.scrollHeight;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new WeatherChatbot();
});
