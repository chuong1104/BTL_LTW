document.addEventListener('DOMContentLoaded', () => {
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeBtn = document.querySelector('.close-btn');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const chatbotForm = document.getElementById('chatbot-form');
    const userInputField = document.getElementById('user-input');
    const messagesContainer = document.getElementById('messages');

    const API_KEY = 'AIzaSyDVTYAeK0qvg_uC5n0XosEOYfdPFuVyx1I';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // Toggle chatbot visibility
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            chatbotContainer.classList.toggle('active');
            chatbotToggle.classList.toggle('hidden');
        });
    }

    // Close chatbot
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            chatbotContainer.classList.remove('active');
            if (chatbotToggle) {
                chatbotToggle.classList.remove('hidden');
            }
        });
    }

    // Minimize chatbot (basic toggle, can be expanded)
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            chatbotContainer.classList.toggle('minimized'); // You'll need to add CSS for .minimized
            // A simple way to minimize is to reduce height or hide body/footer
            const body = chatbotContainer.querySelector('.chatbot-body');
            const footer = chatbotContainer.querySelector('.chatbot-footer');
            if (body && footer) {
                if (chatbotContainer.classList.contains('minimized')) {
                    body.style.display = 'none';
                    footer.style.display = 'none';
                    chatbotContainer.style.height = '50px'; // Adjust as needed
                } else {
                    body.style.display = 'flex';
                    footer.style.display = 'block';
                    chatbotContainer.style.height = '500px'; // Original height
                }
            }
        });
    }

    // Clear chat history
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            messagesContainer.innerHTML = '';
            // Thêm lại lời chào nếu muốn:
            addMessageToUI("Xin chào! Tôi là trợ lý ảo của JanyPet. Tôi có thể giúp gì cho bạn về các sản phẩm và dịch vụ dành cho thú cưng?", "bot");
        });
    }

    // Handle form submission
    if (chatbotForm) {
        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = userInputField.value.trim();
            if (!userMessage) return;

            addMessageToUI(userMessage, 'user');
            userInputField.value = '';
            showTypingIndicator();

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: userMessage,
                                    },
                                ],
                            },
                        ],
                    }),
                });

                removeTypingIndicator();

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    addMessageToUI(`Lỗi: ${errorData.error?.message || response.statusText || 'Không thể kết nối tới bot.'}`, 'bot', true);
                    return;
                }

                const data = await response.json();
                
                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                    const botResponse = data.candidates[0].content.parts[0].text;
                    addMessageToUI(botResponse, 'bot');
                } else {
                    addMessageToUI('Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.', 'bot', true);
                }

            } catch (error) {
                removeTypingIndicator();
                console.error('Fetch Error:', error);
                addMessageToUI('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.', 'bot', true);
            }
        });
    }

    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot', 'typing-indicator');
        typingIndicator.innerHTML = `
            <div class="message-content">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function addMessageToUI(message, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        if (isError && sender === 'bot') {
            messageDiv.classList.add('error');
        }

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        messageContentDiv.textContent = message; // Use textContent to prevent XSS

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('time');
        timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(messageContentDiv);
        messageDiv.appendChild(timeSpan);
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Initial greeting if needed, or keep the static one in HTML
    // addMessageToUI("Xin chào! Tôi là trợ lý ảo của JanyPet. Tôi có thể giúp gì cho bạn?", "bot");
});