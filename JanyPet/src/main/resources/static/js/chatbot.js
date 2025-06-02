document.addEventListener('DOMContentLoaded', () => {
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeBtn = document.querySelector('.close-btn');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const chatbotForm = document.getElementById('chatbot-form');
    const userInputField = document.getElementById('user-input');
    const messagesContainer = document.getElementById('messages');

    

    // ĐỊNH NGHĨA ENDPOINT API BACKEND CỦA BẠN
    const BACKEND_API_URL = '/api/chatbot/query'; // API endpoint trên backend của bạn

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

    // Minimize chatbot
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            chatbotContainer.classList.toggle('minimized');
            const body = chatbotContainer.querySelector('.chatbot-body');
            const footer = chatbotContainer.querySelector('.chatbot-footer');
            if (body && footer) {
                if (chatbotContainer.classList.contains('minimized')) {
                    body.style.display = 'none';
                    footer.style.display = 'none';
                    chatbotContainer.style.height = '50px'; // Hoặc chiều cao header
                } else {
                    body.style.display = 'flex'; // Hoặc giá trị display ban đầu
                    footer.style.display = 'block'; // Hoặc giá trị display ban đầu
                    chatbotContainer.style.height = '500px'; // Chiều cao ban đầu
                }
            }
        });
    }

    // Clear chat history
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            messagesContainer.innerHTML = '';
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
                // GỌI API BACKEND
                const response = await sendWithRetry(userMessage);

                removeTypingIndicator();

                if (response && response.botResponse) {
                    addMessageToUI(response.botResponse, 'bot');
                } else {
                    addMessageToUI('Xin lỗi, tôi không nhận được phản hồi phù hợp từ máy chủ.', 'bot', true);
                }

            } catch (error) {
                removeTypingIndicator();
                console.error('Fetch Error to Backend:', error);
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
        if (sender === 'bot' && !isError) {
            messageContentDiv.innerHTML = message; // Use innerHTML for bot's HTML formatted responses
        } else {
            messageContentDiv.textContent = message; // Use textContent for user messages and errors
        }

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

    // Lời chào ban đầu được giữ lại từ HTML trong file chatbot-widget.html

    async function sendWithRetry(message, maxRetries = 3, delay = 2000) {
        let attempts = 0;
        
        while (attempts < maxRetries) {
            try {
                const response = await fetch(BACKEND_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }),
                });
                
                if (response.ok) {
                    return await response.json();
                }
                
                // If 503 error, wait and retry
                if (response.status === 503) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                // Other error
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            } catch (error) {
                if (attempts >= maxRetries) throw error;
                attempts++;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new Error("Maximum retry attempts reached");
    }
});