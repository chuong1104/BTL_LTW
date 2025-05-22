/**
 * Toast Notification Service
 * Provides a centralized way to display toast notifications
 */

// Create the toast service as a global object
window.toastService = (() => {
    // Toast container element
    const toastElement = document.getElementById('toast');
    const toastContent = document.querySelector('#toast .toast-content');
    const toastMessage = document.querySelector('#toast .toast-message');
    const toastProgress = document.querySelector('#toast .toast-progress');
    
    // Default settings
    const defaults = {
        duration: 3000, // Duration in ms
        showProgress: true,
        autoClose: true,
    };
    
    // Toast states
    let activeTimeout = null;
    let isVisible = false;
    
    // Show a toast notification
    const showToast = (message, type = 'success', options = {}) => {
        // Combine default options with provided options
        const settings = { ...defaults, ...options };
        
        // Clear any existing timeout
        if (activeTimeout) {
            clearTimeout(activeTimeout);
        }
        
        // Set the message
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        
        // Reset classes
        if (toastElement) {
            toastElement.className = 'toast';
            
            // Add the type class
            toastElement.classList.add(`toast-${type}`);
            
            // Change the icon based on type
            const icon = toastContent.querySelector('i');
            if (icon) {
                icon.className = ''; // Clear existing classes
                
                // Set appropriate icon class based on type
                switch (type) {
                    case 'success':
                        icon.className = 'fas fa-check-circle';
                        break;
                    case 'error':
                        icon.className = 'fas fa-exclamation-circle';
                        break;
                    case 'warning':
                        icon.className = 'fas fa-exclamation-triangle';
                        break;
                    case 'info':
                        icon.className = 'fas fa-info-circle';
                        break;
                    default:
                        icon.className = 'fas fa-check-circle';
                }
            }
            
            // Show the toast
            toastElement.classList.add('show');
            isVisible = true;
            
            // Setup progress bar if enabled
            if (settings.showProgress && toastProgress) {
                // Reset the animation
                toastProgress.style.animation = 'none';
                void toastProgress.offsetWidth; // Trigger reflow
                toastProgress.style.animation = `progress ${settings.duration / 1000}s linear forwards`;
            }
            
            // Auto-close if enabled
            if (settings.autoClose) {
                activeTimeout = setTimeout(() => {
                    hideToast();
                }, settings.duration);
            }
        } else {
            // Fallback if toast element doesn't exist
            console.log(`Toast Notification (${type}): ${message}`);
        }
    };
    
    // Hide the toast notification
    const hideToast = () => {
        if (toastElement && isVisible) {
            toastElement.classList.remove('show');
            isVisible = false;
            
            if (activeTimeout) {
                clearTimeout(activeTimeout);
                activeTimeout = null;
            }
        }
    };
    
    // Convenience methods for different types of toasts
    const showSuccessToast = (message, options = {}) => {
        showToast(message, 'success', options);
    };
    
    const showErrorToast = (message, options = {}) => {
        showToast(message, 'error', options);
    };
    
    const showWarningToast = (message, options = {}) => {
        showToast(message, 'warning', options);
    };
    
    const showInfoToast = (message, options = {}) => {
        showToast(message, 'info', options);
    };
    
    // Initialize event listeners
    const init = () => {
        // Close button functionality
        const closeButton = document.querySelector('#toast .close');
        if (closeButton) {
            closeButton.addEventListener('click', hideToast);
        }
        
        // Click anywhere on the toast to dismiss
        if (toastElement) {
            toastElement.addEventListener('click', () => {
                hideToast();
            });
        }
    };
    
    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Public API
    return {
        showToast,
        hideToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast
    };
})();
