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
                const response = await fetch(BACKEND_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: userMessage, // Chỉ gửi tin nhắn người dùng
                    }),
                });

                removeTypingIndicator();

                if (!response.ok) {
                    let errorMessage = 'Lỗi kết nối với máy chủ hỗ trợ.';
                    try {
                        const errorData = await response.json();
                        // Ưu tiên message từ backend nếu có, nếu không thì dùng statusText
                        errorMessage = errorData.botResponse || errorData.message || `Lỗi ${response.status}: ${response.statusText}`;
                    } catch (parseError) {
                        // Nếu không parse được JSON lỗi, dùng statusText
                         errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Không thể xử lý phản hồi lỗi từ máy chủ.'}`;
                    }
                    console.error('Backend API Error:', response.status, errorMessage);
                    addMessageToUI(errorMessage, 'bot', true);
                    return;
                }

                const data = await response.json();
                
                if (data && data.botResponse) {
                    addMessageToUI(data.botResponse, 'bot');
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
});